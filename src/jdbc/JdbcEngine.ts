/**
 * JDBC (Java Database Connectivity) Emulation Engine
 * Implements java.sql interfaces:
 * - DriverManager
 * - Connection
 * - PreparedStatement
 * - Statement
 * - ResultSet
 * - ResultSetMetaData
 * - SQLException
 * 
 * Provides interactive SQL query execution, transaction handling (commit/rollback),
 * and automatic Java JDBC code generation.
 */

export interface ResultSetMetaData {
  getColumnCount(): number;
  getColumnName(columnIndex: number): string;
  getColumnTypeName(columnIndex: number): string;
}

export interface ResultSet {
  next(): boolean;
  getString(columnName: string): string | null;
  getInt(columnName: string): number | null;
  getDouble(columnName: string): number | null;
  getObject(columnName: string): any;
  getMetaData(): ResultSetMetaData;
  allRows(): Record<string, any>[];
  rowCount(): number;
}

export interface PreparedStatement {
  setString(paramIndex: number, value: string): void;
  setInt(paramIndex: number, value: number): void;
  setDouble(paramIndex: number, value: number): void;
  setObject(paramIndex: number, value: any): void;
  executeQuery(): ResultSet;
  executeUpdate(): number;
}

export interface Statement {
  executeQuery(sql: string): ResultSet;
  executeUpdate(sql: string): number;
}

export interface Connection {
  prepareStatement(sql: string): PreparedStatement;
  createStatement(): Statement;
  setAutoCommit(autoCommit: boolean): void;
  getAutoCommit(): boolean;
  commit(): void;
  rollback(): void;
  close(): void;
  isClosed(): boolean;
}

export interface QueryExecutionResult {
  sql: string;
  boundParams: any[];
  executionTimeMs: number;
  rowsAffected?: number;
  resultSet?: {
    columns: Array<{ name: string; type: string }>;
    rows: Record<string, any>[];
  };
  javaSnippet: string;
  error?: string;
  transactionStatus: string;
}

// Relational tables storage
export interface DatabaseTables {
  customers: Array<{
    customer_id: string;
    full_name: string;
    phone: string;
    email: string;
    city: string;
    address: string;
    total_bookings: number;
    total_spent: number;
    tier: string;
  }>;
  shipments: Array<{
    tracking_number: string;
    sender_id: string;
    receiver_id: string;
    service_type: string;
    package_type: string;
    weight_kg: number;
    shipping_fee: number;
    status: string;
    booking_date: string;
    estimated_delivery_date: string;
    fragile: boolean;
  }>;
  checkpoints: Array<{
    checkpoint_id: string;
    tracking_number: string;
    status: string;
    facility: string;
    city: string;
    operator_id: string;
    timestamp: string;
    description: string;
  }>;
  courier_agents: Array<{
    agent_id: string;
    name: string;
    phone: string;
    badge_number: string;
    vehicle_plate: string;
    hub_location: string;
  }>;
}

export class JdbcEngine {
  private db: DatabaseTables;
  private transactionBackup: DatabaseTables | null = null;
  private autoCommit: boolean = true;
  private closed: boolean = false;
  private connectionUrl: string = 'jdbc:postgresql://quicktrack-db:5432/quicktrack_logistics';
  private dbUser: string = 'courier_admin';

  constructor(initialTables?: DatabaseTables) {
    this.db = initialTables || {
      customers: [],
      shipments: [],
      checkpoints: [],
      courier_agents: [],
    };
  }

  public setTables(tables: DatabaseTables): void {
    this.db = JSON.parse(JSON.stringify(tables));
  }

  public getTables(): DatabaseTables {
    return this.db;
  }

  public getConnectionUrl(): string {
    return this.connectionUrl;
  }

  public getDbUser(): string {
    return this.dbUser;
  }

  public setAutoCommit(auto: boolean): void {
    this.autoCommit = auto;
    if (!auto && !this.transactionBackup) {
      this.transactionBackup = JSON.parse(JSON.stringify(this.db));
    }
  }

  public getAutoCommit(): boolean {
    return this.autoCommit;
  }

  public commit(): void {
    this.transactionBackup = JSON.parse(JSON.stringify(this.db));
  }

  public rollback(): void {
    if (this.transactionBackup) {
      this.db = JSON.parse(JSON.stringify(this.transactionBackup));
    }
  }

  // Prepares and executes a SQL query with parameters, generating java JDBC code & results
  public executeJdbcStatement(
    sql: string,
    params: any[] = []
  ): QueryExecutionResult {
    const startTime = performance.now();
    const cleanSql = sql.trim();
    const upperSql = cleanSql.toUpperCase();

    const result: QueryExecutionResult = {
      sql,
      boundParams: params,
      executionTimeMs: 0,
      transactionStatus: this.autoCommit ? 'AUTO_COMMIT: ON' : 'TRANSACTION: IN_PROGRESS (Uncommitted)',
      javaSnippet: this.generateJavaSnippet(cleanSql, params),
    };

    try {
      if (upperSql.startsWith('SELECT')) {
        const queryResult = this.handleSelect(cleanSql, params);
        result.resultSet = queryResult;
      } else if (upperSql.startsWith('INSERT')) {
        const rows = this.handleInsert(cleanSql, params);
        result.rowsAffected = rows;
      } else if (upperSql.startsWith('UPDATE')) {
        const rows = this.handleUpdate(cleanSql, params);
        result.rowsAffected = rows;
      } else if (upperSql.startsWith('DELETE')) {
        const rows = this.handleDelete(cleanSql, params);
        result.rowsAffected = rows;
      } else {
        throw new Error(`Unsupported SQL command: Only SELECT, INSERT, UPDATE, DELETE are supported.`);
      }

      result.executionTimeMs = Number((performance.now() - startTime).toFixed(2));
      return result;
    } catch (err: any) {
      result.error = err.message || 'SQLException occurred during execution.';
      result.executionTimeMs = Number((performance.now() - startTime).toFixed(2));
      return result;
    }
  }

  private handleSelect(
    sql: string,
    params: any[]
  ): { columns: Array<{ name: string; type: string }>; rows: Record<string, any>[] } {
    let rawRows: Record<string, any>[] = [];
    const upper = sql.toUpperCase();

    // Check for JOIN query: shipments JOIN customers
    if (upper.includes('JOIN')) {
      rawRows = this.db.shipments.map(s => {
        const sender = this.db.customers.find(c => c.customer_id === s.sender_id);
        const receiver = this.db.customers.find(c => c.customer_id === s.receiver_id);
        return {
          tracking_number: s.tracking_number,
          status: s.status,
          service_type: s.service_type,
          shipping_fee: s.shipping_fee,
          weight_kg: s.weight_kg,
          sender_name: sender ? sender.full_name : s.sender_id,
          sender_city: sender ? sender.city : '',
          receiver_name: receiver ? receiver.full_name : s.receiver_id,
          receiver_city: receiver ? receiver.city : '',
          booking_date: s.booking_date,
          estimated_delivery_date: s.estimated_delivery_date,
        };
      });
    } else if (upper.includes('FROM SHIPMENTS')) {
      rawRows = [...this.db.shipments];
    } else if (upper.includes('FROM CUSTOMERS')) {
      rawRows = [...this.db.customers];
    } else if (upper.includes('FROM CHECKPOINTS')) {
      rawRows = [...this.db.checkpoints];
    } else if (upper.includes('FROM COURIER_AGENTS')) {
      rawRows = [...this.db.courier_agents];
    } else {
      throw new Error(`Table not found in query.`);
    }

    // Process WHERE clause if present
    if (upper.includes('WHERE')) {
      const wherePart = sql.substring(sql.search(/WHERE/i) + 5).trim();
      const orderByIndex = wherePart.search(/ORDER BY/i);
      const conditionStr = orderByIndex !== -1 ? wherePart.substring(0, orderByIndex).trim() : wherePart;

      let paramIdx = 0;
      rawRows = rawRows.filter(row => {
        return this.evaluateWhereCondition(row, conditionStr, params, paramIdx);
      });
    }

    // Process ORDER BY clause if present
    if (upper.includes('ORDER BY')) {
      const orderPart = sql.substring(sql.search(/ORDER BY/i) + 8).trim();
      const [col, dir] = orderPart.split(/\s+/);
      const isDesc = dir && dir.toUpperCase() === 'DESC';
      const cleanCol = col.replace(/;/g, '').trim().toLowerCase();

      rawRows.sort((a, b) => {
        const valA = a[cleanCol];
        const valB = b[cleanCol];
        if (valA === valB) return 0;
        if (valA === undefined) return 1;
        if (valB === undefined) return -1;
        if (isDesc) {
          return valA < valB ? 1 : -1;
        }
        return valA > valB ? 1 : -1;
      });
    }

    // Process LIMIT clause if present
    if (upper.includes('LIMIT')) {
      const match = sql.match(/LIMIT\s+(\d+)/i);
      if (match) {
        const limit = parseInt(match[1], 10);
        rawRows = rawRows.slice(0, limit);
      }
    }

    // Extract columns metadata
    const firstRow = rawRows[0] || {};
    const columns: Array<{ name: string; type: string }> = Object.keys(firstRow).map(key => {
      const val = firstRow[key];
      let type = 'VARCHAR';
      if (typeof val === 'number') {
        type = Number.isInteger(val) ? 'INTEGER' : 'DOUBLE';
      } else if (typeof val === 'boolean') {
        type = 'BOOLEAN';
      } else if (key.includes('date') || key.includes('time')) {
        type = 'TIMESTAMP';
      }
      return { name: key, type };
    });

    return { columns, rows: rawRows };
  }

  private evaluateWhereCondition(row: Record<string, any>, conditionStr: string, params: any[], paramIdx: number): boolean {
    const cond = conditionStr.replace(/;/g, '').trim();

    // Check equality: column = ? or column = 'value'
    if (cond.includes('=')) {
      const parts = cond.split('=').map(p => p.trim());
      const colName = parts[0].toLowerCase().split('.').pop() || '';
      let targetVal = parts[1];

      if (targetVal === '?') {
        targetVal = params[paramIdx];
      } else {
        targetVal = targetVal.replace(/^'|'$/g, '');
      }

      const rowVal = row[colName];
      if (typeof rowVal === 'number') {
        return Number(rowVal) === Number(targetVal);
      }
      return String(rowVal).toUpperCase() === String(targetVal).toUpperCase();
    }

    // Check LIKE: column LIKE ? or column LIKE '%value%'
    if (cond.toUpperCase().includes('LIKE')) {
      const parts = cond.split(/LIKE/i).map(p => p.trim());
      const colName = parts[0].toLowerCase().split('.').pop() || '';
      let pattern = parts[1];
      if (pattern === '?') {
        pattern = params[paramIdx];
      } else {
        pattern = pattern.replace(/^'|'$/g, '');
      }
      const cleanPattern = String(pattern).replace(/%/g, '').toUpperCase();
      return String(row[colName] || '').toUpperCase().includes(cleanPattern);
    }

    return true;
  }

  private handleInsert(sql: string, params: any[]): number {
    const upper = sql.toUpperCase();
    if (upper.includes('INTO CHECKPOINTS')) {
      const checkpoint_id = `CHK-${Date.now().toString().slice(-4)}`;
      const tracking_number = params[0] || 'QT-BOOKED';
      const status = params[1] || 'IN_TRANSIT';
      const facility = params[2] || 'QuickTrack Central Hub';
      const city = params[3] || 'Central';
      const operator_id = params[4] || 'OPR-101';
      const timestamp = new Date().toISOString();
      const description = params[5] || 'Scan recorded via JDBC PreparedStatement';

      this.db.checkpoints.push({
        checkpoint_id,
        tracking_number,
        status,
        facility,
        city,
        operator_id,
        timestamp,
        description,
      });

      // Update shipment status as well
      const shipment = this.db.shipments.find(s => s.tracking_number === tracking_number);
      if (shipment) {
        shipment.status = status;
      }
      return 1;
    }
    return 1;
  }

  private handleUpdate(sql: string, params: any[]): number {
    const upper = sql.toUpperCase();
    if (upper.includes('UPDATE SHIPMENTS')) {
      // Example: UPDATE shipments SET status = ? WHERE tracking_number = ?
      const newStatus = params[0];
      const trackingNumber = params[1];
      let affected = 0;
      for (const s of this.db.shipments) {
        if (!trackingNumber || s.tracking_number === trackingNumber) {
          s.status = newStatus;
          affected++;
        }
      }
      return affected;
    }
    return 0;
  }

  private handleDelete(sql: string, params: any[]): number {
    const upper = sql.toUpperCase();
    if (upper.includes('FROM CHECKPOINTS')) {
      const id = params[0];
      const initial = this.db.checkpoints.length;
      this.db.checkpoints = this.db.checkpoints.filter(c => c.checkpoint_id !== id);
      return initial - this.db.checkpoints.length;
    }
    return 0;
  }

  // Generates real copyable Java JDBC code with Connection, PreparedStatement, and ResultSet
  public generateJavaSnippet(sql: string, params: any[]): string {
    const isQuery = sql.trim().toUpperCase().startsWith('SELECT');
    let paramSetters = '';

    params.forEach((param, idx) => {
      const pNum = idx + 1;
      if (typeof param === 'number') {
        if (Number.isInteger(param)) {
          paramSetters += `        pstmt.setInt(${pNum}, ${param});\n`;
        } else {
          paramSetters += `        pstmt.setDouble(${pNum}, ${param});\n`;
        }
      } else if (typeof param === 'boolean') {
        paramSetters += `        pstmt.setBoolean(${pNum}, ${param});\n`;
      } else {
        paramSetters += `        pstmt.setString(${pNum}, "${param}");\n`;
      }
    });

    if (isQuery) {
      return `import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class CourierJdbcService {
    private static final String URL = "${this.connectionUrl}";
    private static final String USER = "${this.dbUser}";
    private static final String PASS = "••••••••••••";

    public void executeQuery() {
        String sql = "${sql.replace(/\n/g, ' ')}";

        try (Connection conn = DriverManager.getConnection(URL, USER, PASS);
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
${paramSetters || '            // No parameter bindings required\n'}
            try (ResultSet rs = pstmt.executeQuery()) {
                System.out.println("--- Query Results ---");
                while (rs.next()) {
                    // Iterate through ResultSet records
                    System.out.println(rs.getString(1));
                }
            }
        } catch (SQLException e) {
            System.err.println("Database Error Code: " + e.getErrorCode());
            e.printStackTrace();
        }
    }
}`;
    } else {
      return `import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class CourierJdbcService {
    private static final String URL = "${this.connectionUrl}";
    private static final String USER = "${this.dbUser}";
    private static final String PASS = "••••••••••••";

    public int executeUpdate() {
        String sql = "${sql.replace(/\n/g, ' ')}";

        try (Connection conn = DriverManager.getConnection(URL, USER, PASS);
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            ${this.autoCommit ? '// Auto-commit enabled' : 'conn.setAutoCommit(false); // Transaction Started'}
${paramSetters || '            // No parameter bindings required\n'}
            int rowsAffected = pstmt.executeUpdate();
            ${this.autoCommit ? '' : 'conn.commit(); // Transaction Committed'}
            System.out.println("Rows modified: " + rowsAffected);
            return rowsAffected;
        } catch (SQLException e) {
            ${this.autoCommit ? '' : 'conn.rollback(); // Transaction Rolled Back on Error'}
            e.printStackTrace();
            return 0;
        }
    }
}`;
    }
  }
}
