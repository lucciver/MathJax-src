/*************************************************************
 *
 *  Copyright (c) 2017 The MathJax Consortium
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
 * @fileoverview  Implements the CHTMLmpadded wrapper for the MmlMpadded object
 *
 * @author dpvc@mathjax.org (Davide Cervone)
 */

import {CHTMLWrapper, CHTMLConstructor, StringMap} from '../Wrapper.js';
import {CommonMpadded, CommonMpaddedInterface} from '../../common/Wrappers/mpadded.js';
import {MmlMpadded} from '../../../core/MmlTree/MmlNodes/mpadded.js';
import {StyleList} from '../../common/CssStyles.js';

/*****************************************************************/
/**
 * The CHTMLmpadded wrapper for the MmlMpadded object
 *
 * @template N  The HTMLElement node class
 * @template T  The Text node class
 * @template D  The Document class
 */
export class CHTMLmpadded<N, T, D> extends CommonMpadded<N, T, D, CHTMLConstructor<N, T, D>>(CHTMLWrapper) {

    public static kind = MmlMpadded.prototype.kind;

    public static styles: StyleList = {
        'mjx-mpadded': {
            display: 'inline-block'
        },
        'mjx-rbox': {
            display: 'inline-block',
            position: 'relative'
        }
    };

    /**
     * @override
     */
    public toCHTML(parent: N) {
        let chtml = this.standardCHTMLnode(parent);
        const content: N[] = [];
        const style: StringMap = {};
        const [H, D, W, dh, dd, dw, x, y] = this.getDimens();
        //
        // If the width changed, set the width explicitly
        //
        if (dw) {
            style.width = this.em(W + dw);
        }
        //
        // If the height or depth changed, use margin to make the change
        //
        if (dh || dd) {
            style.margin = this.em(dh) + ' 0 ' + this.em(dd);
        }
        //
        // If there is a horizontal or vertical shift,
        //   use relative positioning to move the contents
        //
        if (x || y) {
            style.position = 'relative';
            content.push(this.html('mjx-rbox', {style: {left: this.em(x), top: this.em(-y)}}));
        }
        //
        //  Create the HTML with the proper styles and content
        //
        chtml = this.adaptor.append(chtml, this.html('mjx-block', {style: style}, content)) as N;
        for (const child of this.childNodes) {
            child.toCHTML(content[0] || chtml);
        }
    }

}
