/*************************************************************
 *
 *  MathJax/jax/input/TeX/Stack.js
 *
 *  Implements the TeX InputJax that reads mathematics in
 *  TeX and LaTeX format and converts it to the MML ElementJax
 *  internal format.
 *
 *  ---------------------------------------------------------------------
 *
 *  Copyright (c) 2009-2017 The MathJax Consortium
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */


/**
 * @fileoverview The Stack for the TeX parser.
 *
 * @author v.sorge@mathjax.org (Volker Sorge)
 */


import {TreeHelper} from './TreeHelper.js';
import {MmlNode} from '../../core/MmlTree/MmlNode.js';
import {StartItem, MmlItem} from './BaseItems.js';
import {StackItem, EnvList, BaseItem} from './StackItem.js';
import StackItemFactory from './StackItemFactory.js';


export default class Stack {

  /**
   * @type {EnvList}
   */
  public global: EnvList = {};

  /**
   * The actual stack, a list of stack items.
   * @type {Array.<StackItem>}
   */
  private stack: StackItem[] = [];

  /**
   * @constructor
   * @param {EnvList} _env The environment.
   * @param {boolean} inner True if parser has been called recursively.
   */
  constructor(private _factory: StackItemFactory,
              private _env: EnvList, inner: boolean) {
    this.global = {isInner: inner};
    this.stack = [ this._factory.create('start', this.global) ];
    if (_env) {
      this.stack[0].env = _env;
    }
    this.env = this.stack[0].env;
  }

  public set env(env: EnvList) {
    this._env = env;
  }

  public get env(): EnvList {
    return this._env;
  }


  /**
   * Pushes items or nodes onto stack.
   * @param {...StackItem|MmlNode} args A list of items to push.
   */
  public Push(...args: (StackItem|MmlNode)[]) {
    for (let i = 0, m = args.length; i < m; i++) {
      const node = args[i];
      if (!node) {
        continue;
      }
      const item = TreeHelper.isNode(node) ?
        this._factory.create('mml', node) : node;
      item.global = this.global;
      const top = this.stack.length ? this.Top().checkItem(item) : true;
      if (top instanceof Array) {
        this.Pop();
        this.Push.apply(this, top);
      }
      else if (top instanceof BaseItem) {
        this.Pop();
        this.Push(top);
      }
      else if (top) {
        this.stack.push(item);
        if (item.env) {
          for (let id in this.env) {
            if (this.env.hasOwnProperty(id)) {
              item.env[id] = this.env[id];
            }
          }
          this.env = item.env;
        } else {
          item.env = this.env;
        }
      }
    }
  }


  /**
   * Pop the topmost elements off the stack.
   * @return {StackItem} A stack item.
   */
  public Pop() {
    const item = this.stack.pop();
    if (!item.isOpen) {
      delete item.env;
    }
    this.env = (this.stack.length ? this.Top().env : {});
    return item;
  }


  /**
   * Lookup the nth elements on the stack without removing them.
   * @param {number=} n Position of element that should be returned. Default 1.
   * @return {StackItem} Nth item on the stack.
   */
  public Top(n?: number): StackItem {
    if (n == null) {
      n = 1;
    }
    return this.stack.length < n ? null : this.stack[this.stack.length - n];
  }


  /**
   * Lookup the topmost element on the stack, returning the Mml node in that
   * item. Optionally pops the Mml node from that stack item.
   * @param {boolean=} noPop Pop top item if true.
   * @return {MmlNode} The Mml node in the topmost stack item.
   */
  public Prev(noPop?: boolean): MmlNode | void {
    const top = this.Top();
    return noPop ? top.Last : top.Pop();
  }


  /**
   * @override
   */
  public toString() {
    return 'stack[\n  ' + this.stack.join('\n  ') + '\n]';
  }

}
