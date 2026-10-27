/**
 * Doubly Linked List Implementation
 * Used specifically for the Checkpoint Timeline of each shipment:
 * Origin -> Sorting Facility -> Transit Hub -> Out for Delivery -> Delivered
 * Supports bi-directional traversal, node insertion, and pointer inspection.
 */

export class DoublyNode<T> {
  id: string;
  data: T;
  prev: DoublyNode<T> | null = null;
  next: DoublyNode<T> | null = null;

  constructor(id: string, data: T) {
    this.id = id;
    this.data = data;
  }
}

export interface LinkedListVisualNode<T> {
  id: string;
  data: T;
  prevId: string | null;
  nextId: string | null;
  isHead: boolean;
  isTail: boolean;
  index: number;
}

export class DoublyLinkedList<T> {
  private head: DoublyNode<T> | null = null;
  private tail: DoublyNode<T> | null = null;
  private count: number = 0;

  constructor(items?: Array<{ id: string; data: T }>) {
    if (items) {
      for (const item of items) {
        this.append(item.id, item.data);
      }
    }
  }

  // O(1) append to end (newest checkpoint)
  append(id: string, data: T): DoublyNode<T> {
    const newNode = new DoublyNode<T>(id, data);
    if (!this.head || !this.tail) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.prev = this.tail;
      this.tail.next = newNode;
      this.tail = newNode;
    }
    this.count++;
    return newNode;
  }

  // O(1) prepend to head
  prepend(id: string, data: T): DoublyNode<T> {
    const newNode = new DoublyNode<T>(id, data);
    if (!this.head || !this.tail) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head.prev = newNode;
      this.head = newNode;
    }
    this.count++;
    return newNode;
  }

  // Remove the tail checkpoint (rollback action)
  removeTail(): DoublyNode<T> | null {
    if (!this.tail) return null;
    const removed = this.tail;
    if (this.head === this.tail) {
      this.head = null;
      this.tail = null;
    } else {
      this.tail = this.tail.prev;
      if (this.tail) {
        this.tail.next = null;
      }
    }
    this.count--;
    return removed;
  }

  // Remove a specific node by ID
  remove(id: string): boolean {
    let curr = this.head;
    while (curr) {
      if (curr.id === id) {
        if (curr === this.head && curr === this.tail) {
          this.head = null;
          this.tail = null;
        } else if (curr === this.head) {
          this.head = curr.next;
          if (this.head) this.head.prev = null;
        } else if (curr === this.tail) {
          this.tail = curr.prev;
          if (this.tail) this.tail.next = null;
        } else {
          if (curr.prev) curr.prev.next = curr.next;
          if (curr.next) curr.next.prev = curr.prev;
        }
        this.count--;
        return true;
      }
      curr = curr.next;
    }
    return false;
  }

  getHead(): DoublyNode<T> | null {
    return this.head;
  }

  getTail(): DoublyNode<T> | null {
    return this.tail;
  }

  size(): number {
    return this.count;
  }

  isEmpty(): boolean {
    return this.count === 0;
  }

  // Traverse forward (Head -> Tail)
  toArray(): T[] {
    const list: T[] = [];
    let curr = this.head;
    while (curr) {
      list.push(curr.data);
      curr = curr.next;
    }
    return list;
  }

  // Traverse backward (Tail -> Head)
  toArrayReversed(): T[] {
    const list: T[] = [];
    let curr = this.tail;
    while (curr) {
      list.push(curr.data);
      curr = curr.prev;
    }
    return list;
  }

  // Return detailed nodes with prev/next pointers for visualizer
  getVisualNodes(): LinkedListVisualNode<T>[] {
    const visualNodes: LinkedListVisualNode<T>[] = [];
    let curr = this.head;
    let idx = 0;
    while (curr) {
      visualNodes.push({
        id: curr.id,
        data: curr.data,
        prevId: curr.prev ? curr.prev.id : null,
        nextId: curr.next ? curr.next.id : null,
        isHead: curr === this.head,
        isTail: curr === this.tail,
        index: idx,
      });
      idx++;
      curr = curr.next;
    }
    return visualNodes;
  }
}
