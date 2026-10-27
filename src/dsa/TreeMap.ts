/**
 * Red-Black Tree Implementation (TreeMap)
 * Modeled after java.util.TreeMap.
 * Provides self-balancing O(log N) insertion, search, and in-order chronological
 * traversal of shipments by Scheduled Delivery Date (ETA) and priority.
 * Supports range queries: subMap, headMap, tailMap.
 */

export type NodeColor = 'RED' | 'BLACK';

export interface TreeMapVisualNode<K, V> {
  key: K;
  value: V;
  color: NodeColor;
  depth: number;
  hasLeft: boolean;
  hasRight: boolean;
  leftKey?: K;
  rightKey?: K;
}

export class RBNode<K, V> {
  key: K;
  value: V;
  color: NodeColor = 'RED';
  left: RBNode<K, V> | null = null;
  right: RBNode<K, V> | null = null;
  parent: RBNode<K, V> | null = null;

  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
  }
}

export type Comparator<K> = (a: K, b: K) => number;

export class CustomTreeMap<K, V> {
  private root: RBNode<K, V> | null = null;
  private count: number = 0;
  private readonly comparator: Comparator<K>;

  constructor(comparator?: Comparator<K>) {
    this.comparator = comparator || ((a: K, b: K) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  }

  size(): number {
    return this.count;
  }

  isEmpty(): boolean {
    return this.root === null;
  }

  // Left Rotation
  private rotateLeft(node: RBNode<K, V>): void {
    const rightChild = node.right;
    if (!rightChild) return;

    node.right = rightChild.left;
    if (rightChild.left) {
      rightChild.left.parent = node;
    }

    rightChild.parent = node.parent;
    if (!node.parent) {
      this.root = rightChild;
    } else if (node === node.parent.left) {
      node.parent.left = rightChild;
    } else {
      node.parent.right = rightChild;
    }

    rightChild.left = node;
    node.parent = rightChild;
  }

  // Right Rotation
  private rotateRight(node: RBNode<K, V>): void {
    const leftChild = node.left;
    if (!leftChild) return;

    node.left = leftChild.right;
    if (leftChild.right) {
      leftChild.right.parent = node;
    }

    leftChild.parent = node.parent;
    if (!node.parent) {
      this.root = leftChild;
    } else if (node === node.parent.right) {
      node.parent.right = leftChild;
    } else {
      node.parent.left = leftChild;
    }

    leftChild.right = node;
    node.parent = leftChild;
  }

  // O(log N) Red-Black Tree Insertion & Rebalancing
  put(key: K, value: V): void {
    const newNode = new RBNode<K, V>(key, value);
    if (!this.root) {
      newNode.color = 'BLACK';
      this.root = newNode;
      this.count++;
      return;
    }

    let parent: RBNode<K, V> | null = null;
    let curr: RBNode<K, V> | null = this.root;

    while (curr) {
      parent = curr;
      const cmp = this.comparator(key, curr.key);
      if (cmp < 0) {
        curr = curr.left;
      } else if (cmp > 0) {
        curr = curr.right;
      } else {
        // Key already exists, update value
        curr.value = value;
        return;
      }
    }

    newNode.parent = parent;
    if (parent) {
      const cmp = this.comparator(key, parent.key);
      if (cmp < 0) {
        parent.left = newNode;
      } else {
        parent.right = newNode;
      }
    }

    this.count++;
    this.fixAfterInsertion(newNode);
  }

  private fixAfterInsertion(node: RBNode<K, V>): void {
    let curr = node;
    while (curr.parent && curr.parent.color === 'RED') {
      const grandParent = curr.parent.parent;
      if (!grandParent) break;

      if (curr.parent === grandParent.left) {
        const uncle = grandParent.right;
        if (uncle && uncle.color === 'RED') {
          // Case 1: Uncle is red -> Recoloring
          curr.parent.color = 'BLACK';
          uncle.color = 'BLACK';
          grandParent.color = 'RED';
          curr = grandParent;
        } else {
          // Case 2: Node is right child -> Left rotation
          if (curr === curr.parent.right) {
            curr = curr.parent;
            this.rotateLeft(curr);
          }
          // Case 3: Node is left child -> Right rotation & Recolor
          if (curr.parent) {
            curr.parent.color = 'BLACK';
            grandParent.color = 'RED';
            this.rotateRight(grandParent);
          }
        }
      } else {
        // Symmetric case: parent is right child of grandparent
        const uncle = grandParent.left;
        if (uncle && uncle.color === 'RED') {
          curr.parent.color = 'BLACK';
          uncle.color = 'BLACK';
          grandParent.color = 'RED';
          curr = grandParent;
        } else {
          if (curr === curr.parent.left) {
            curr = curr.parent;
            this.rotateRight(curr);
          }
          if (curr.parent) {
            curr.parent.color = 'BLACK';
            grandParent.color = 'RED';
            this.rotateLeft(grandParent);
          }
        }
      }
    }

    if (this.root) {
      this.root.color = 'BLACK';
    }
  }

  // O(log N) lookup
  get(key: K): V | undefined {
    let curr = this.root;
    while (curr) {
      const cmp = this.comparator(key, curr.key);
      if (cmp === 0) return curr.value;
      if (cmp < 0) {
        curr = curr.left;
      } else {
        curr = curr.right;
      }
    }
    return undefined;
  }

  firstKey(): K | undefined {
    if (!this.root) return undefined;
    let curr = this.root;
    while (curr.left) {
      curr = curr.left;
    }
    return curr.key;
  }

  lastKey(): K | undefined {
    if (!this.root) return undefined;
    let curr = this.root;
    while (curr.right) {
      curr = curr.right;
    }
    return curr.key;
  }

  // In-order traversal -> returns all entries sorted by key ascending
  inOrderTraversal(): Array<{ key: K; value: V; color: NodeColor }> {
    const result: Array<{ key: K; value: V; color: NodeColor }> = [];
    const traverse = (node: RBNode<K, V> | null) => {
      if (!node) return;
      traverse(node.left);
      result.push({ key: node.key, value: node.value, color: node.color });
      traverse(node.right);
    };
    traverse(this.root);
    return result;
  }

  // Range query: fromKey <= key <= toKey
  subMap(fromKey: K, toKey: K): Array<{ key: K; value: V }> {
    const result: Array<{ key: K; value: V }> = [];
    const traverse = (node: RBNode<K, V> | null) => {
      if (!node) return;
      if (this.comparator(node.key, fromKey) >= 0) {
        traverse(node.left);
      }
      if (this.comparator(node.key, fromKey) >= 0 && this.comparator(node.key, toKey) <= 0) {
        result.push({ key: node.key, value: node.value });
      }
      if (this.comparator(node.key, toKey) <= 0) {
        traverse(node.right);
      }
    };
    traverse(this.root);
    return result;
  }

  // Head map: key <= toKey
  headMap(toKey: K): Array<{ key: K; value: V }> {
    const result: Array<{ key: K; value: V }> = [];
    const traverse = (node: RBNode<K, V> | null) => {
      if (!node) return;
      traverse(node.left);
      if (this.comparator(node.key, toKey) <= 0) {
        result.push({ key: node.key, value: node.value });
        traverse(node.right);
      }
    };
    traverse(this.root);
    return result;
  }

  // Tail map: key >= fromKey
  tailMap(fromKey: K): Array<{ key: K; value: V }> {
    const result: Array<{ key: K; value: V }> = [];
    const traverse = (node: RBNode<K, V> | null) => {
      if (!node) return;
      if (this.comparator(node.key, fromKey) >= 0) {
        traverse(node.left);
        result.push({ key: node.key, value: node.value });
      }
      traverse(node.right);
    };
    traverse(this.root);
    return result;
  }

  // Breadth-first / structured visual nodes for UI rendering
  getVisualTreeNodes(): TreeMapVisualNode<K, V>[] {
    const list: TreeMapVisualNode<K, V>[] = [];
    if (!this.root) return list;

    const queue: Array<{ node: RBNode<K, V>; depth: number }> = [{ node: this.root, depth: 0 }];

    while (queue.length > 0) {
      const { node, depth } = queue.shift()!;
      list.push({
        key: node.key,
        value: node.value,
        color: node.color,
        depth,
        hasLeft: !!node.left,
        hasRight: !!node.right,
        leftKey: node.left ? node.left.key : undefined,
        rightKey: node.right ? node.right.key : undefined,
      });

      if (node.left) queue.push({ node: node.left, depth: depth + 1 });
      if (node.right) queue.push({ node: node.right, depth: depth + 1 });
    }

    return list;
  }

  getHeight(): number {
    const height = (node: RBNode<K, V> | null): number => {
      if (!node) return 0;
      return 1 + Math.max(height(node.left), height(node.right));
    };
    return height(this.root);
  }
}
