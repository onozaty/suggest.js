/*
--------------------------------------------------------
suggest.js - Input Suggest
入力補完ライブラリ

Released under the Creative Commons License(Attribution 2.1 Japan):
クリエイティブ・コモンズの帰属 2.1 Japanライセンスの下でライセンスされています。
 http://creativecommons.org/licenses/by/2.1/jp/

For details, see the web site:
使用方法については、下記を参照してください。
 http://www.enjoyxstudy.com/javascript/suggest

--------------------------------------------------------
- Enjyo×Study <http://www.enjoyxstudy.com>
--------------------------------------------------------

ver 0.1 2006/01/15
  ・公開
ver 0.2 2006/02/05
  ・機能改善
--------------------------------------------------------
*/

var IncSearch = {};

IncSearch.Suggest = Class.create();
IncSearch.Suggest.prototype = {
  initialize: function(input, suggestArea, candidateList) {
    this.input = $(input);
    this.suggestArea = $(suggestArea);
    this.candidateList = candidateList;

    this.suggestList = null;
    this.activePosition = null;
    this.timer = null;

    this.oldText = this.input.value;

    if (arguments[3]) this.setOptions(arguments[3]);

    // reg event
    Event.observe(this.input, 'focus', this.checkLoop.bindAsEventListener(this), false);
    Event.observe(this.input, 'blur', this.blur.bindAsEventListener(this), false);

    if (window.opera) {
      Event._observeAndCache(this.input, 'keypress', this.keyevent.bindAsEventListener(this), false);
    } else {
      Event.observe(this.input, 'keypress', this.keyevent.bindAsEventListener(this), false);
    }

    // init
    this.clearSuggestArea();
  },

  // options
  interval: 500,
  dispMax: 20,
  listTagName: 'div',
  isMatch: function(value, pattern) {
    return (value.toLowerCase().indexOf(pattern.toLowerCase()) != -1);
  },
  activeDisplay: function(elm) {
    elm.style.backgroundColor = '#3366FF';
    elm.style.color = '#FFFFFF';
  },
  unactiveDisplay: function(elm) {
    elm.style.backgroundColor = '';
    elm.style.color = '';
  },
  moverDisplay: function(elm) {
    elm.style.backgroundColor = '#99CCFF';
    elm.style.color = '';
  },

  setOptions: function(options) {
    if (options.interval)
      this.interval = options.interval;

    if (options.dispMax)
      this.dispMax = options.dispMax;

    if (options.isMatch)
      this.isMatch = options.isMatch;

    if (options.activeDisplay)
      this.activeDisplay = options.activeDisplay;

    if (options.unactiveDisplay)
      this.unactiveDisplay = options.unactiveDisplay;

    if (options.moverDisplay)
      this.moverDisplay = options.moverDisplay;

    if (options.listTagName)
      this.listTagName = options.listTagName;
  },

  checkLoop: function() {
    if (this.input.value != this.oldText) {
      this.oldText = this.input.value;
      this.search();
    }
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(this.checkLoop.bind(this), this.interval);
  },

  // key event
  keyevent: function(event) {
    if (event.keyCode == Event.KEY_UP ||
        event.keyCode == Event.KEY_DOWN) {
      // key move
      this.moveActiveList(event.keyCode);
    } else if (event.keyCode == Event.KEY_RETURN) {
      // fix
      if (this.suggestList) {
        Event.stop(event);
        this.clearSuggestArea();
      }
    } else if (event.keyCode == Event.KEY_ESC) {
      // cancel
      if (this.suggestList) {
        Event.stop(event);
        this.clearSuggestArea();
        this.input.value = this.inputText;
        this.oldText = this.input.value;
      }
    }
  },

  search: function() {

    // init
    this.clearSuggestArea();

    if (this.input.value == '') return;

    var pattern = this.input.value;

    var resultList = new Array();

    for (var i = 0; i < this.candidateList.length; i++) {

      if (this.isMatch(this.candidateList[i], pattern)) {
        resultList.push(this.candidateList[i]);

        if (this.dispMax != 0 && resultList.length >= this.dispMax) break;
      }
    }

    if (resultList != 0){
      this.createSuggestArea(resultList);
    }
  },

  clearSuggestArea: function() {
    this.suggestArea.innerHTML = '';
    this.suggestArea.style.display = 'none';
    this.suggestList = null;
    this.activePosition = null;
  },

  createSuggestArea: function(resultList) {

    this.suggestList = new Array();
    this.inputText = this.input.value;

    for (var i = 0; i < resultList.length; i++) {
      var elm = document.createElement(this.listTagName);
      elm.innerHTML = resultList[i];
      this.suggestArea.appendChild(elm);

      Event.observe(elm, 'click',
        new Function('event', 'this.listClick(event, ' + i + ');').bindAsEventListener(this), false);
      Event.observe(elm, 'mouseover',
        new Function('event', 'this.listOver(event, ' + i + ');').bindAsEventListener(this), false);
      Event.observe(elm, 'mouseout',
        new Function('event', 'this.listOut(event, ' + i + ');').bindAsEventListener(this), false);

      this.suggestList.push(elm);
    }

    this.suggestArea.style.display = 'block';
  },

  moveActiveList: function(keyCode) {

    if (!this.suggestList ||
        this.suggestList.length == 0){
      return;
    }

    this.unactive();

    if (keyCode == Event.KEY_UP) {
      // up
      if (this.activePosition == null) {
        this.activePosition = this.suggestList.length -1;
      }else{
        this.activePosition--;
        if (this.activePosition < 0) {
          this.activePosition = null;
          this.input.value = this.inputText;
          return;
        }
      }
    }else{
      // down
      if (this.activePosition == null) {
        this.activePosition = 0;
      }else{
        this.activePosition++;
      }

      if (this.activePosition >= this.suggestList.length) {
        this.activePosition = null;
        this.input.value = this.inputText;
        return;
      }
    }

    this.active(this.suggestList[this.activePosition]);
  },

  active: function(activeElement) {

    this.activeDisplay(activeElement);

    this.input.value = activeElement.innerHTML;
    this.oldText = this.input.value;
    this.input.focus();
  },

  unactive: function() {

    if (this.suggestList != null 
        && this.suggestList.length > 0
        && this.activePosition != null) {
      this.unactiveDisplay(this.suggestList[this.activePosition]);
    }
  },

  blur: function(event) {

    this.unactive();
    this.oldText = this.input.value;

    if (this.timer) clearTimeout(this.timer);
    this.timer = null;

    setTimeout((function(){ this.clearSuggestArea(); }).bind(this), 500);
  },

  listClick: function(event, index) {

    var elm = Event.element(event);

    this.unactive();
    this.activePosition = index;
    this.active(elm);
  },

  listOver: function(event, index) {
    var elm = Event.element(event);
    this.moverDisplay(elm);
  },

  listOut: function(event, index) {

    var elm = Event.element(event);

    if (!this.suggestList) return;

    if (index == this.activePosition) {
      this.activeDisplay(elm);
    }else{
      this.unactiveDisplay(elm);
    }
  }
};
