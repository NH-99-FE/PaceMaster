/*
 * @Author: lianglonghui_i lianglonghui_i
 * @Date: 2026-01-09 19:08:58
 * @LastEditors: lianglonghui_i lianglonghui_i
 * @LastEditTime: 2026-01-12 14:35:08
 * @FilePath: /react-practice/leedcode.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[]}
 */
var preorderTraversal = function (root) {
  let res = [];
  const dfs = root => {
    if (root === null) return;
    dfs(root.left);
    dfs(root.right);
    res.push(root.val);
  };
  dfs(root);
  return res;
};
