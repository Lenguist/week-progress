/**
 * @typedef {Object} SankeyNode
 * @property {string} id
 * @property {string} name
 * @property {number} hours
 * @property {boolean=} expanded
 * @property {SankeyNode=} parent
 * @property {SankeyNode[]=} children
 */

/**
 * @typedef {Object} LayoutNode
 * @property {SankeyNode} node
 * @property {number} depth
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 */

