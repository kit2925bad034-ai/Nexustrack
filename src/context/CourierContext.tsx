import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Shipment, Customer, Checkpoint, BookingFormData, ShipmentStatus } from '../types';
import { INITIAL_CUSTOMERS, INITIAL_SHIPMENTS, INITIAL_COURIER_AGENTS } from '../data/mockData';
import { DoublyLinkedList } from '../dsa/LinkedList';
import { CustomHashMap, HashMapDiagnostic } from '../dsa/HashMap';
import { CustomTreeMap, TreeMapVisualNode } from '../dsa/TreeMap';
import { JdbcEngine, QueryExecutionResult, DatabaseTables } from '../jdbc/JdbcEngine';

interface CourierContextType {
  shipments: Shipment[];
  customers: Customer[];
  selectedShipment: Shipment | null;
  setSelectedShipment: (shipment: Shipment | null) => void;
  selectShipmentByTracking: (trackingNumber: string) => boolean;
  bookShipment: (formData: BookingFormData) => Shipment;
  updateShipmentStatus: (
    trackingNumber: string,
    newStatus: ShipmentStatus,
    facility: string,
    city: string,
    description: string,
    operatorId?: string
  ) => boolean;
  rollbackLastCheckpoint: (trackingNumber: string) => boolean;
  createCustomer: (customerData: Partial<Customer>) => Customer;
  searchShipments: (query: string) => Shipment[];
  
  // DSA Inspectors & Engines
  getDoublyLinkedListForShipment: (trackingNumber: string) => DoublyLinkedList<Checkpoint> | undefined;
  getHashMapDiagnostics: () => { shipmentMap: HashMapDiagnostic; customerMap: HashMapDiagnostic };
  probeTrackingNumberInHashMap: (trackingNumber: string) => { found: boolean; steps: number; bucketIndex: number; hash: number };
  getTreeMapVisualNodes: () => TreeMapVisualNode<string, Shipment>[];
  getTreeMapRange: (fromDate: string, toDate: string) => Array<{ key: string; value: Shipment }>;
  
  // JDBC Engine
  jdbcEngine: JdbcEngine;
  lastJdbcResult: QueryExecutionResult | null;
  executeJdbcQuery: (sql: string, params?: any[]) => QueryExecutionResult;
  jdbcTables: DatabaseTables;
  syncRelationalTables: () => void;
}

const CourierContext = createContext<CourierContextType | null>(null);

export const CourierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(INITIAL_SHIPMENTS[0]);
  const [lastJdbcResult, setLastJdbcResult] = useState<QueryExecutionResult | null>(null);

  // Initialize algorithmic data structures in memory
  const shipmentHashMap = useMemo(() => new CustomHashMap<string, Shipment>(16, 0.75), []);
  const customerHashMap = useMemo(() => new CustomHashMap<string, Customer>(16, 0.75), []);
  const deliveryTreeMap = useMemo(() => new CustomTreeMap<string, Shipment>((a, b) => a.localeCompare(b)), []);
  
  // Doubly linked lists per shipment (trackingNumber -> DoublyLinkedList<Checkpoint>)
  const checkpointLists = useMemo(() => new Map<string, DoublyLinkedList<Checkpoint>>(), []);

  // JDBC Engine Instance
  const jdbcEngine = useMemo(() => new JdbcEngine(), []);

  // Sync state into algorithmic data structures & relational database
  const syncDataStructures = useCallback((currentShipments: Shipment[], currentCustomers: Customer[]) => {
    // 1. HashMap population
    shipmentHashMap.clear();
    customerHashMap.clear();

    for (const customer of currentCustomers) {
      customerHashMap.put(customer.customerId, customer);
      customerHashMap.put(customer.phone, customer);
    }

    for (const shipment of currentShipments) {
      shipmentHashMap.put(shipment.trackingNumber, shipment);

      // 2. TreeMap population (Key is estimatedDeliveryDate + unique suffix to prevent collision on same minute)
      const treeKey = `${shipment.estimatedDeliveryDate}#${shipment.trackingNumber}`;
      deliveryTreeMap.put(treeKey, shipment);

      // 3. Doubly LinkedList population
      const dlist = new DoublyLinkedList<Checkpoint>(
        shipment.checkpoints.map(cp => ({ id: cp.id, data: cp }))
      );
      checkpointLists.set(shipment.trackingNumber, dlist);
    }

    // 4. JDBC Relational Tables sync
    const relationalDb: DatabaseTables = {
      customers: currentCustomers.map(c => ({
        customer_id: c.customerId,
        full_name: c.fullName,
        phone: c.phone,
        email: c.email,
        city: c.city,
        address: c.address,
        total_bookings: c.totalBookings,
        total_spent: c.totalSpent,
        tier: c.tier,
      })),
      shipments: currentShipments.map(s => ({
        tracking_number: s.trackingNumber,
        sender_id: s.senderId,
        receiver_id: s.receiverId,
        service_type: s.serviceType,
        package_type: s.packageType,
        weight_kg: s.weightKg,
        shipping_fee: s.shippingFee,
        status: s.status,
        booking_date: s.bookingDate,
        estimated_delivery_date: s.estimatedDeliveryDate,
        fragile: s.fragile,
      })),
      checkpoints: currentShipments.flatMap(s => 
        s.checkpoints.map(cp => ({
          checkpoint_id: cp.id,
          tracking_number: s.trackingNumber,
          status: cp.status,
          facility: cp.facility,
          city: cp.city,
          operator_id: cp.operatorId,
          timestamp: cp.timestamp,
          description: cp.description,
        }))
      ),
      courier_agents: INITIAL_COURIER_AGENTS.map((ca, idx) => ({
        agent_id: `AGT-${idx + 101}`,
        name: ca.name,
        phone: ca.phone,
        badge_number: ca.badgeNumber,
        vehicle_plate: ca.vehiclePlate,
        hub_location: ca.hubLocation,
      })),
    };

    jdbcEngine.setTables(relationalDb);
  }, [shipmentHashMap, customerHashMap, deliveryTreeMap, checkpointLists, jdbcEngine]);

  useEffect(() => {
    syncDataStructures(shipments, customers);
    // Run an initial demo query for JDBC tab
    const initialQuery = jdbcEngine.executeJdbcStatement(
      "SELECT tracking_number, status, service_type, shipping_fee, booking_date FROM shipments ORDER BY booking_date DESC;"
    );
    setLastJdbcResult(initialQuery);
  }, []);

  // O(1) Fast lookup via HashMap
  const selectShipmentByTracking = useCallback((trackingNumber: string): boolean => {
    const found = shipmentHashMap.get(trackingNumber.trim().toUpperCase());
    if (found) {
      setSelectedShipment(found);
      return true;
    }
    // Fallback: search by partial or customer phone
    const alt = shipments.find(s => 
      s.trackingNumber.toUpperCase().includes(trackingNumber.toUpperCase()) ||
      s.senderPhone.includes(trackingNumber) ||
      s.receiverPhone.includes(trackingNumber)
    );
    if (alt) {
      setSelectedShipment(alt);
      return true;
    }
    return false;
  }, [shipmentHashMap, shipments]);

  // Book a new shipment
  const bookShipment = useCallback((formData: BookingFormData): Shipment => {
    const trackingSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingPrefix = Math.floor(1000 + Math.random() * 9000);
    const trackingNumber = `QT-${trackingPrefix}-${trackingSuffix}`;
    const nowIso = new Date().toISOString();

    // Determine ETA based on service tier
    const etaDate = new Date();
    if (formData.serviceType === 'SAME_DAY') {
      etaDate.setHours(etaDate.getHours() + 8);
    } else if (formData.serviceType === 'EXPRESS_AIR') {
      etaDate.setDate(etaDate.getDate() + 1);
    } else if (formData.serviceType === 'PRIORITY_GROUND') {
      etaDate.setDate(etaDate.getDate() + 3);
    } else {
      etaDate.setDate(etaDate.getDate() + 5);
    }
    const estimatedDeliveryDate = etaDate.toISOString();

    // Calculate base shipping fee in INR (₹) based on dimensional weight & service
    const dimensionalWeight = (formData.lengthCm * formData.widthCm * formData.heightCm) / 5000;
    const billableWeight = Math.max(formData.weightKg, dimensionalWeight);
    const rateMultiplier = formData.serviceType === 'SAME_DAY' ? 450 : formData.serviceType === 'EXPRESS_AIR' ? 320 : formData.serviceType === 'PRIORITY_GROUND' ? 180 : 120;
    const calculatedFee = Number((billableWeight * rateMultiplier + (formData.insurance ? 250 : 0) + (formData.fragile ? 150 : 0)).toFixed(2));

    // Handle sender customer record
    let senderCust = customers.find(c => c.phone === formData.senderPhone || c.email.toLowerCase() === formData.senderEmail.toLowerCase());
    let updatedCustomers = [...customers];
    let senderId = senderCust ? senderCust.customerId : `CUST-${Math.floor(1000 + Math.random() * 9000)}`;

    if (!senderCust) {
      senderCust = {
        customerId: senderId,
        fullName: formData.senderName,
        phone: formData.senderPhone,
        email: formData.senderEmail,
        address: formData.senderAddress,
        city: formData.senderCity,
        postalCode: '560001',
        createdAt: nowIso,
        totalBookings: 1,
        totalSpent: calculatedFee,
        tier: 'REGULAR',
      };
      updatedCustomers.push(senderCust);
    } else {
      updatedCustomers = updatedCustomers.map(c => 
        c.customerId === senderCust!.customerId 
          ? { ...c, totalBookings: c.totalBookings + 1, totalSpent: Number((c.totalSpent + calculatedFee).toFixed(2)) }
          : c
      );
    }

    // Receiver ID
    const receiverId = `CUST-${Math.floor(2000 + Math.random() * 8000)}`;

    // Initial checkpoint
    const initialCheckpoint: Checkpoint = {
      id: `CHK-${Date.now().toString().slice(-4)}`,
      trackingNumber,
      timestamp: nowIso,
      status: 'BOOKED',
      facility: `QuickTrack ${formData.senderCity} Branch`,
      city: formData.senderCity,
      locationCode: `${formData.senderCity.slice(0, 3).toUpperCase()}-BKG-01`,
      operatorId: 'SYS-DISPATCH',
      description: 'Shipment order booked and barcode waybill generated.',
    };

    const newShipment: Shipment = {
      trackingNumber,
      senderId,
      senderName: formData.senderName,
      senderPhone: formData.senderPhone,
      senderEmail: formData.senderEmail,
      senderAddress: formData.senderAddress,
      senderCity: formData.senderCity,
      receiverId,
      receiverName: formData.receiverName,
      receiverPhone: formData.receiverPhone,
      receiverEmail: formData.receiverEmail,
      receiverAddress: formData.receiverAddress,
      receiverCity: formData.receiverCity,
      serviceType: formData.serviceType,
      packageType: formData.packageType,
      priority: formData.priority,
      weightKg: formData.weightKg,
      dimensionsCm: {
        length: formData.lengthCm,
        width: formData.widthCm,
        height: formData.heightCm,
      },
      declaredValue: formData.declaredValue,
      shippingFee: calculatedFee,
      status: 'BOOKED',
      bookingDate: nowIso,
      estimatedDeliveryDate,
      fragile: formData.fragile,
      insurance: formData.insurance,
      signatureRequired: formData.signatureRequired,
      notes: formData.notes,
      checkpoints: [initialCheckpoint],
    };

    const nextShipments = [newShipment, ...shipments];
    setCustomers(updatedCustomers);
    setShipments(nextShipments);
    setSelectedShipment(newShipment);
    syncDataStructures(nextShipments, updatedCustomers);

    // Execute JDBC INSERT PreparedStatement log
    jdbcEngine.executeJdbcStatement(
      "INSERT INTO checkpoints (tracking_no, status, facility, city, operator, desc) VALUES (?, ?, ?, ?, ?, ?);",
      [trackingNumber, 'BOOKED', initialCheckpoint.facility, initialCheckpoint.city, 'SYS-DISPATCH', initialCheckpoint.description]
    );

    return newShipment;
  }, [customers, shipments, syncDataStructures, jdbcEngine]);

  // Update status and add a checkpoint node into Doubly LinkedList
  const updateShipmentStatus = useCallback((
    trackingNumber: string,
    newStatus: ShipmentStatus,
    facility: string,
    city: string,
    description: string,
    operatorId: string = 'OPR-DISPATCH'
  ): boolean => {
    const shipment = shipments.find(s => s.trackingNumber === trackingNumber);
    if (!shipment) return false;

    const nowIso = new Date().toISOString();
    const newCheckpoint: Checkpoint = {
      id: `CHK-${Date.now().toString().slice(-4)}`,
      trackingNumber,
      timestamp: nowIso,
      status: newStatus,
      facility,
      city,
      locationCode: `${city.slice(0, 3).toUpperCase()}-FAC-01`,
      operatorId,
      description,
    };

    // Update Doubly LinkedList
    const dlist = checkpointLists.get(trackingNumber);
    if (dlist) {
      dlist.append(newCheckpoint.id, newCheckpoint);
    }

    // Assign a courier if moving to OUT_FOR_DELIVERY
    let assignedCourier = shipment.assignedCourier;
    if (newStatus === 'OUT_FOR_DELIVERY' && !assignedCourier) {
      assignedCourier = INITIAL_COURIER_AGENTS[Math.floor(Math.random() * INITIAL_COURIER_AGENTS.length)];
    }

    const updatedShipment: Shipment = {
      ...shipment,
      status: newStatus,
      deliveredDate: newStatus === 'DELIVERED' ? nowIso : shipment.deliveredDate,
      assignedCourier,
      checkpoints: [...shipment.checkpoints, newCheckpoint],
    };

    const nextShipments = shipments.map(s => s.trackingNumber === trackingNumber ? updatedShipment : s);
    setShipments(nextShipments);
    if (selectedShipment?.trackingNumber === trackingNumber) {
      setSelectedShipment(updatedShipment);
    }

    syncDataStructures(nextShipments, customers);

    // Execute JDBC Update & Insert
    jdbcEngine.executeJdbcStatement(
      "UPDATE shipments SET status = ? WHERE tracking_number = ?;",
      [newStatus, trackingNumber]
    );
    jdbcEngine.executeJdbcStatement(
      "INSERT INTO checkpoints (tracking_no, status, facility, city, operator, desc) VALUES (?, ?, ?, ?, ?, ?);",
      [trackingNumber, newStatus, facility, city, operatorId, description]
    );

    return true;
  }, [shipments, selectedShipment, customers, checkpointLists, syncDataStructures, jdbcEngine]);

  // Rollback checkpoint from Doubly LinkedList
  const rollbackLastCheckpoint = useCallback((trackingNumber: string): boolean => {
    const shipment = shipments.find(s => s.trackingNumber === trackingNumber);
    if (!shipment || shipment.checkpoints.length <= 1) return false;

    const dlist = checkpointLists.get(trackingNumber);
    if (dlist) {
      dlist.removeTail();
    }

    const nextCheckpoints = shipment.checkpoints.slice(0, -1);
    const prevCheckpoint = nextCheckpoints[nextCheckpoints.length - 1];

    const updatedShipment: Shipment = {
      ...shipment,
      status: prevCheckpoint.status,
      checkpoints: nextCheckpoints,
      deliveredDate: prevCheckpoint.status !== 'DELIVERED' ? undefined : shipment.deliveredDate,
    };

    const nextShipments = shipments.map(s => s.trackingNumber === trackingNumber ? updatedShipment : s);
    setShipments(nextShipments);
    if (selectedShipment?.trackingNumber === trackingNumber) {
      setSelectedShipment(updatedShipment);
    }

    syncDataStructures(nextShipments, customers);
    return true;
  }, [shipments, selectedShipment, customers, checkpointLists, syncDataStructures]);

  // Create a customer
  const createCustomer = useCallback((customerData: Partial<Customer>): Customer => {
    const newCust: Customer = {
      customerId: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: customerData.fullName || 'Anonymous Customer',
      phone: customerData.phone || '+91 98000 00000',
      email: customerData.email || 'customer@quicktrack.in',
      company: customerData.company,
      address: customerData.address || '45 MG Road',
      city: customerData.city || 'Bengaluru',
      postalCode: customerData.postalCode || '560001',
      createdAt: new Date().toISOString(),
      totalBookings: 0,
      totalSpent: 0,
      tier: 'REGULAR',
    };

    const nextCustomers = [newCust, ...customers];
    setCustomers(nextCustomers);
    syncDataStructures(shipments, nextCustomers);
    return newCust;
  }, [customers, shipments, syncDataStructures]);

  // Search shipments across fields
  const searchShipments = useCallback((query: string): Shipment[] => {
    if (!query.trim()) return shipments;
    const q = query.trim().toUpperCase();
    return shipments.filter(s => 
      s.trackingNumber.toUpperCase().includes(q) ||
      s.senderName.toUpperCase().includes(q) ||
      s.receiverName.toUpperCase().includes(q) ||
      s.senderCity.toUpperCase().includes(q) ||
      s.receiverCity.toUpperCase().includes(q) ||
      s.status.toUpperCase().includes(q)
    );
  }, [shipments]);

  // DSA Helper getters
  const getDoublyLinkedListForShipment = useCallback((trackingNumber: string) => {
    return checkpointLists.get(trackingNumber);
  }, [checkpointLists]);

  const getHashMapDiagnostics = useCallback(() => {
    return {
      shipmentMap: shipmentHashMap.getDiagnostics(),
      customerMap: customerHashMap.getDiagnostics(),
    };
  }, [shipmentHashMap, customerHashMap]);

  const probeTrackingNumberInHashMap = useCallback((trackingNumber: string) => {
    return shipmentHashMap.probe(trackingNumber);
  }, [shipmentHashMap]);

  const getTreeMapVisualNodes = useCallback(() => {
    return deliveryTreeMap.getVisualTreeNodes();
  }, [deliveryTreeMap]);

  const getTreeMapRange = useCallback((fromDate: string, toDate: string) => {
    return deliveryTreeMap.subMap(fromDate, toDate);
  }, [deliveryTreeMap]);

  // JDBC query runner
  const executeJdbcQuery = useCallback((sql: string, params: any[] = []) => {
    const result = jdbcEngine.executeJdbcStatement(sql, params);
    setLastJdbcResult(result);
    return result;
  }, [jdbcEngine]);

  const syncRelationalTables = useCallback(() => {
    syncDataStructures(shipments, customers);
  }, [syncDataStructures, shipments, customers]);

  return (
    <CourierContext.Provider
      value={{
        shipments,
        customers,
        selectedShipment,
        setSelectedShipment,
        selectShipmentByTracking,
        bookShipment,
        updateShipmentStatus,
        rollbackLastCheckpoint,
        createCustomer,
        searchShipments,
        getDoublyLinkedListForShipment,
        getHashMapDiagnostics,
        probeTrackingNumberInHashMap,
        getTreeMapVisualNodes,
        getTreeMapRange,
        jdbcEngine,
        lastJdbcResult,
        executeJdbcQuery,
        jdbcTables: jdbcEngine.getTables(),
        syncRelationalTables,
      }}
    >
      {children}
    </CourierContext.Provider>
  );
};

export const useCourier = () => {
  const context = useContext(CourierContext);
  if (!context) {
    throw new Error('useCourier must be used within a CourierProvider');
  }
  return context;
};
