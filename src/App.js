import { Input } from 'antd';
import { useState } from 'react';
import './App.css';

function App() {
  const [txt, setTxt] = useState(''); // gia tri * #
  const [txt2, setTxt2] = useState('');// gia tri hien thi 
  const [len, setLen] = useState(0); // do dai tu bi cat xuong dong
  const { TextArea } = Input;

  function getInputSelection(el) {
    var start = 0, end = 0, normalizedValue, range,
      textInputRange, len, endRange;

    if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
      start = el.selectionStart;
      end = el.selectionEnd;
    } else {
      range = document.selection.createRange();

      if (range && range.parentElement() == el) {
        len = el.value.length;
        normalizedValue = el.value.replace(/\r\n/g, "\n");

        // Create a working TextRange that lives only in the input
        textInputRange = el.createTextRange();
        textInputRange.moveToBookmark(range.getBookmark());

        // Check if the start and end of the selection are at the very end
        // of the input, since moveStart/moveEnd doesn't return what we want
        // in those cases
        endRange = el.createTextRange();
        endRange.collapse(false);

        if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
          start = end = len;
        } else {
          start = -textInputRange.moveStart("character", -len);
          start += normalizedValue.slice(0, start).split("\n").length - 1;

          if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
            end = len;
          } else {
            end = -textInputRange.moveEnd("character", -len);
            end += normalizedValue.slice(0, end).split("\n").length - 1;
          }
        }
      }
    }

    return {
      start: start,
      end: end
    };
  }

  function offsetToRangeCharacterMove(el, offset) {
    return offset - (el.value.slice(0, offset).split("\r\n").length - 1);
  }

  function setInputSelection(el, startOffset, endOffset) {
    if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
      el.selectionStart = startOffset;
      el.selectionEnd = endOffset;
    } else {
      var range = el.createTextRange();
      var startCharMove = offsetToRangeCharacterMove(el, startOffset);
      range.collapse(true);
      if (startOffset == endOffset) {
        range.move("character", startCharMove);
      } else {
        range.moveEnd("character", offsetToRangeCharacterMove(el, endOffset));
        range.moveStart("character", startCharMove);
      }
      range.select();
    }
  }

  function getCaretPosition(ctrl) {
    // IE < 9 Support 
    if (document.selection) {
      ctrl.focus();
      var range = document.selection.createRange();
      var rangelen = range.text.length;
      range.moveStart('character', -ctrl.value.length);
      var start = range.text.length - rangelen;
      return {
        'start': start,
        'end': start + rangelen
      };
    } // IE >=9 and other browsers
    else if (ctrl.selectionStart || ctrl.selectionStart == '0') {
      return {
        'start': ctrl.selectionStart,
        'end': ctrl.selectionEnd
      };
    } else {
      return {
        'start': 0,
        'end': 0
      };
    }
  }

  function setCaretPosition(ctrl, start, end) {
    // IE >= 9 and other browsers
    if (ctrl.setSelectionRange) {
      ctrl.focus();
      ctrl.setSelectionRange(start, end);
    }
    // IE < 9 
    else if (ctrl.createTextRange) {
      var range = ctrl.createTextRange();
      range.collapse(true);
      range.moveEnd('character', end);
      range.moveStart('character', start);
      range.select();
    }
  }
  
  const spliceTxt = (txt, limit) => {
    let result = [];
    let t1, tempText, lstIndex;
    while (txt.length > limit) {
      tempText = txt.slice(0, limit);
      lstIndex = tempText.lastIndexOf(" ");
      lstIndex = lstIndex > 0 ? lstIndex : limit;
      t1 = ltrim(txt.slice(0, lstIndex));
      txt = ltrim(txt.slice(lstIndex, txt.length));
      result.push(t1);
    }
    result.push(txt);
    return result;
  }

  function ltrim(str) {
    if (!str) return str;
    return str.replace(/^\s+/g, '');
  }

  const formatline = (lines, limit) => {
    let tmp = lines.split('#');
    let b = [];
    tmp = tmp.map(x => {
      let a = x.replace(/\*/g, ' ');
      b = spliceTxt(a, limit).join('*');
      return b;
    });
    tmp = tmp.join('#');
    return tmp;
  }

  const changeTxt = (e, id, maxLines, maxChar) => {
    let tx = e.target.value;

    var t = document.getElementById(id);
    var sel = getInputSelection(t);

    let
      lines = tx.replace(/\n /g, '*').replace(/\n/g, '#'),
      res = '', limit = maxLines * maxChar;

    // format tung dong
    res = formatline(lines, maxChar);

    // toi da {maxChar} ki tu
    if (res.length > limit) {
      res = res.slice(0, limit);
    }
    setTxt(res);

    let tmp = res.replace(/\#/g, '\n').replace(/\*/g, '\n ');

    tmp = tmp.split("\n");
    // toi da {maxLines} dong
    if (tmp.length > maxLines) {
      tmp = tmp.slice(0, maxLines);
    }
    tmp = tmp.join('\n');

    let b = tmp.substring(0, sel.start).split('\n').length; // vi tri dong cua cursor
    let spe = (maxChar * b) - 1; // vi tri dac biet truoc vi tri cuoi - 1
    t.value = tmp;

    setTxt2(tmp);

    console.log(sel.start);
    console.log(sel.end);
    console.log(res);
    if (sel.start == 36 || sel.start == 35) {
      setInputSelection(t, sel.start + 1, sel.end + 1);      
    } else {
      setInputSelection(t, sel.start, sel.end);
    }
    // if (
    //   ((sel.start - (b - 1)) % maxChar != 0) ||  // check neu la vi tri cuoi dong
    //   (spe == sel.start - (b))              // check neu la vi tri truoc cuoi dong - 1
    // ) {
    //   setInputSelection(t, sel.start, sel.end);
    // } else {
    //   setInputSelection(t, (b - 1) * maxChar + b - 1, (b - 1) * maxChar + b - 1);
    // }
    // setInputSelection(t, sel.start, sel.end);

    // if (sel.start == 36 || sel.start == 35 || sel.start == 71 || sel.start == 105 || sel.start == 70 || sel.start == 106) {
    //   setInputSelection(t, sel.start + 1, sel.end + 1);
    // } else {
    //   setInputSelection(t, sel.start, sel.end);
    // }

  }

  return (
    <div className="App">
      <form>
        <p>Textarea with fixed number of characters per line:<br />
          <textarea id="input_box"
            onChange={e => changeTxt(e, "input_box", 4, 35)}
            value={txt2} />
        </p>
        <p style={{ whiteSpace: 'pre-line' }}>{txt2}</p>
      </form>
    </div>
  );
}

export default App;
