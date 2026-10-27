/**
 * Custom HashMap Implementation
 * Modeled after java.util.HashMap with bucket arrays, polynomial hashing,
 * collision chaining, and load factor threshold auto-rehashing.
 * Used for O(1) instant lookup of shipments by Tracking Number and Customers by ID/Phone.
 */

export interface HashEntry<K, V> {
  key: K;
  value: V;
  hash: number;
  next: HashEntry<K, V> | null;
}

export interface BucketStats {
  bucketIndex: number;
  entriesCount: number;
  keys: string[];
}

export interface HashMapDiagnostic {
  capacity: number;
  size: number;
  loadFactor: number;
  threshold: number;
  collisionCount: number;
  maxBucketDepth: number;
  buckets: BucketStats[];
}

export class CustomHashMap<K extends string, V> {
  private buckets: (HashEntry<K, V> | null)[];
  private capacity: number;
  private count: number = 0;
  private readonly loadFactor: number;

  constructor(initialCapacity: number = 16, loadFactor: number = 0.75) {
    this.capacity = initialCapacity;
    this.loadFactor = loadFactor;
    this.buckets = new Array(this.capacity).fill(null);
  }

  // Java-like polynomial hash code: s[0]*31^(n-1) + s[1]*31^(n-2) + ...
  public hashCode(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
    }
    // High-order bit spreading (similar to Java 8 HashMap hash perturbation)
    hash ^= hash >>> 16;
    return hash;
  }

  private getBucketIndex(hash: number, capacity: number = this.capacity): number {
    return Math.abs(hash) % capacity;
  }

  // O(1) average time insertion or update
  put(key: K, value: V): void {
    if ((this.count + 1) / this.capacity > this.loadFactor) {
      this.rehash();
    }

    const hash = this.hashCode(key);
    const index = this.getBucketIndex(hash);
    let head = this.buckets[index];

    // Check if key already exists in the chain
    let curr = head;
    while (curr) {
      if (curr.key === key) {
        curr.value = value;
        return;
      }
      curr = curr.next;
    }

    // Insert at front of bucket chain
    const newEntry: HashEntry<K, V> = {
      key,
      value,
      hash,
      next: head,
    };
    this.buckets[index] = newEntry;
    this.count++;
  }

  // O(1) average time lookup
  get(key: K): V | undefined {
    const hash = this.hashCode(key);
    const index = this.getBucketIndex(hash);
    let curr = this.buckets[index];

    while (curr) {
      if (curr.key === key) {
        return curr.value;
      }
      curr = curr.next;
    }
    return undefined;
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  // Remove key from hash map
  remove(key: K): boolean {
    const hash = this.hashCode(key);
    const index = this.getBucketIndex(hash);
    let curr = this.buckets[index];
    let prev: HashEntry<K, V> | null = null;

    while (curr) {
      if (curr.key === key) {
        if (prev) {
          prev.next = curr.next;
        } else {
          this.buckets[index] = curr.next;
        }
        this.count--;
        return true;
      }
      prev = curr;
      curr = curr.next;
    }
    return false;
  }

  size(): number {
    return this.count;
  }

  getCapacity(): number {
    return this.capacity;
  }

  clear(): void {
    this.buckets = new Array(this.capacity).fill(null);
    this.count = 0;
  }

  keys(): K[] {
    const list: K[] = [];
    for (const head of this.buckets) {
      let curr = head;
      while (curr) {
        list.push(curr.key);
        curr = curr.next;
      }
    }
    return list;
  }

  values(): V[] {
    const list: V[] = [];
    for (const head of this.buckets) {
      let curr = head;
      while (curr) {
        list.push(curr.value);
        curr = curr.next;
      }
    }
    return list;
  }

  entries(): Array<{ key: K; value: V }> {
    const list: Array<{ key: K; value: V }> = [];
    for (const head of this.buckets) {
      let curr = head;
      while (curr) {
        list.push({ key: curr.key, value: curr.value });
        curr = curr.next;
      }
    }
    return list;
  }

  // Resize and re-distribute entries when threshold is reached
  private rehash(): void {
    const oldBuckets = this.buckets;
    this.capacity = this.capacity * 2;
    this.buckets = new Array(this.capacity).fill(null);

    for (const head of oldBuckets) {
      let curr = head;
      while (curr) {
        const next = curr.next;
        const newIndex = this.getBucketIndex(curr.hash, this.capacity);
        curr.next = this.buckets[newIndex];
        this.buckets[newIndex] = curr;
        curr = next;
      }
    }
  }

  // Diagnostic tool to inspect hash buckets, collisions, and performance
  getDiagnostics(): HashMapDiagnostic {
    let collisions = 0;
    let maxDepth = 0;
    const bucketStats: BucketStats[] = [];

    for (let i = 0; i < this.capacity; i++) {
      let depth = 0;
      const keys: string[] = [];
      let curr = this.buckets[i];

      while (curr) {
        depth++;
        keys.push(String(curr.key));
        curr = curr.next;
      }

      if (depth > 1) {
        collisions += (depth - 1);
      }
      if (depth > maxDepth) {
        maxDepth = depth;
      }

      bucketStats.push({
        bucketIndex: i,
        entriesCount: depth,
        keys,
      });
    }

    return {
      capacity: this.capacity,
      size: this.count,
      loadFactor: Number((this.count / this.capacity).toFixed(3)),
      threshold: Math.floor(this.capacity * this.loadFactor),
      collisionCount: collisions,
      maxBucketDepth: maxDepth,
      buckets: bucketStats,
    };
  }

  // Lookup probe with metrics
  probe(key: K): { found: boolean; value?: V; bucketIndex: number; steps: number; hash: number } {
    const hash = this.hashCode(key);
    const index = this.getBucketIndex(hash);
    let curr = this.buckets[index];
    let steps = 0;

    while (curr) {
      steps++;
      if (curr.key === key) {
        return { found: true, value: curr.value, bucketIndex: index, steps, hash };
      }
      curr = curr.next;
    }
    return { found: false, bucketIndex: index, steps, hash };
  }
}
