// ColumnStyles.jsx v. 1.0
// © vetl1489, Vitaly Shutikov
// vetl1489@gmail.com
// Adobe InDesign Script. 
// Менеджер для создания стилей с шириной колонок таблиц.

#target indesign;
#targetengine "cstyle";

// $.locale = "en"; // forces english localization
// $.locale = "ru"; // принудительно включает русскую локализацию

// Локализация скрипта
var Lang = {
  STYLE_PANEL_HEAD: {
    en: "Column Styles",
    ru: "Стили столбцов",
  },
  STYLE_TABLE_NAME: {
    en: "Name",
    ru: "Название",
  },
  STYLE_TABLE_COLUMNS: {
    en: "Columns",
    ru: "Столбцов",
  },

  OPEN_FILE_BUTTON: {
    en: "Open",
    ru: "Открыть",
  },
  SAVE_FILE_BUTTON: {
    en: "Save",
    ru: "Сохранить",
  },
  UP_BUTTON: {
    en: "▲",
    ru: "▲",
  },
  DOWN_BUTTON: {
    en: "▼",
    ru: "▼",
  },
  CLEAR_BUTTON: {
    en: "Clear",
    ru: "Очистить",
  },

  COLUMNS_PANEL_HEAD: {
    en: "Columns",
    ru: "Столбцы",
  },
  CHECK_AUTO: {
    en: "auto",
    ru: "авто",
  },
  ALL_AUTO_BUTTON: {
    en: "All Auto",
    ru: "Всё авто",
  },
  ALL_AUTO_OFF_BUTTON: {
    en: "All Auto OFF",
    ru: "Всё авто ВЫКЛ.",
  },

  SAVE_STYLE_BUTTON: {
    en: "Save style",
    ru: "Сохранить стиль",
  },
  DELETE_STYLE_BUTTON: {
    en: "Delete style",
    ru: "Удалить стиль",
  },
  NEW_STYLE_NAME: {
    en: "New style ",
    ru: "Новый стиль ",
  },

  READ_TABLE_BUTTON: {
    en: "Read table",
    ru: "Считать",
  },
  APPLY_STYLE_BUTTON: {
    en: "Apply",
    ru: "Применить",
  },

  SAVE_DIALOG: {
    en: "Save styles",
    ru: "Сохранить стили",
  },
  OPEN_DIALOG: {
    en: "Open style file",
    ru: "Открыть файл стилей",
  },
  EMPTY_STYLE_LIST: {
    en: "Style list is empty!",
    ru: "Список стилей пустой!",
  },

  ERROR_EDIT_VALUE: {
    en: "Incorrect value:\n",
    ru: "Некорректное значение:\n",
  },
  ERROR_EDIT_IN_COLUMN: {
    en: "in column ",
    ru: "в столбце ",
  },
  ERROR_EDIT_BAD_VALUE: {
    en: " not Number",
    ru: " не число",
  }
};


var Script = {
  NAME: "ColumnStyles", 
  COPY: "© vetl1489",
  AUTHOR: "Vitaly Shutikov",
  VERSION: "v. 1.0",
  TYPE_FILE: "*.cstyle",
  CONFIG_FILE: new File(getScriptFolderPath() + "/ColumnStyles.conf")
};

// Размеры UI
var Sizes = {
  UI_TEXT_HEIGHT: 15, // высота statictext
  UI_EDIT_HEIGHT: 22, // высота edittext
  UI_BUTTON_SIZE: 25, // размер кнопки
  
  UI_TABLE_PANEL_WIDTH: 340, // ширина панели с таблицей
  UI_TABLE_PANEL_HEIGHT: 195, // высота панели с таблицей
  UI_TABLE_COLUMN_WIDTH: [235, 70], // размеры колонок таблицы

  UI_COLUMN_WIDTH: 73, // ширина колонки
  UI_COLUMN_MARGIN: 5, // отступ внутри колонки
  UI_COLUMN_ITEMS_SPACING: 10, // отступ внутри колонки между элементами
  
  UI_SCROLL_GROUP_SPACING: 5, // расстояние между колонками columnsScrollGroup
  UI_SCROLL_GROUP_HEIGHT: 97, // высота скролл-группы
  UI_COLUMN_PANEL_MARGIN: 10, // отступ внутри панели с колонками
  UI_COLUMN_PANEL_COUNT: 5, // количество видимых колонок
  UI_SCROLL_HEIGHT: 20, // высота скроллбара
  UI_NEW_NAME_WIDTH: 150, // ширина поля ввода имени
};

// считываем конфиг
if (!Script.CONFIG_FILE.exists) saveConfig(Script.CONFIG_FILE);
var config = readConfig(Script.CONFIG_FILE);

var currentStyle = null; // текущий стиль колонок

var styleList = config.styleList; // список стилей

var controlsList = []; // список с контролами для стиля
/* Контролы в данном контексте - группы полей UI со значениями ширины и автоширины. */

// флаг для простого исключения события ListBox.onChange()
var tapFlag = false; 


// ============================================
// Добавляем методы String
/**
 * Соединяем строки-аргументы с разделителем.
 * По аналогии метода строк из Python.
 * @argument {String} - соединяемые строки,
 * @returns {String} - результирующая строка.
 */
String.prototype.join = function () {
  var result = "";
  for (var i = 0; i < arguments.length; i++) {
    result += arguments[i];
    if (i < arguments.length - 1) {
      result += this;
    }
  }
  return result;
}

/**
 * Обрезаем пробелы по обеим сторонам строки.
 * @returns {String} - результирующая строка.
 */
String.prototype.trim = function () {
  return this.replace(/^\s+|\s+$/g, "");
}


// ============================================
// Формируем интерфейс
// Окно
var window = new Window("palette", ", ".join(Script.NAME, Script.COPY, Script.VERSION));
  window.margins = 0; 
  window.alignChildren = "top";
  window.orientation = "row";
  window.spacing = 0;
  if (config.windowLocation) window.location = config.windowLocation;
  else window.center();

// ============================================
// Левая колонка
var column1 = window.add("group");
  column1.orientation = "column";
  column1.margins = Sizes.UI_COLUMN_PANEL_MARGIN;

// Панель со стилями
var columnStylesPanel = column1.add("panel");
  columnStylesPanel.text = localize(Lang.STYLE_PANEL_HEAD);
  columnStylesPanel.orientation = "column";
  columnStylesPanel.margins = Sizes.UI_COLUMN_PANEL_MARGIN;
  columnStylesPanel.margins.right = Sizes.UI_COLUMN_PANEL_MARGIN * 6;
  columnStylesPanel.maximumSize.width = Sizes.UI_TABLE_PANEL_WIDTH;

// Таблица стилей
var columnStylesTable = columnStylesPanel.add(
    "listbox", undefined, "",
    { numberOfColumns: 2, showHeaders: true, 
      columnTitles: [
        localize(Lang.STYLE_TABLE_NAME),
        localize(Lang.STYLE_TABLE_COLUMNS)
      ],
      columnWidths: Sizes.UI_TABLE_COLUMN_WIDTH
    }
  );
  columnStylesTable.preferredSize = [
    Sizes.UI_TABLE_PANEL_WIDTH - Sizes.UI_COLUMN_PANEL_MARGIN * 2,
    Sizes.UI_TABLE_PANEL_HEIGHT
  ];

// сразу заполняем ее
for (var i = 0; styleList.length > i; i++) {
  addStyleItem(columnStylesTable, styleList[i]);
}
updateCounter(columnStylesPanel, "styles", styleList);

// Группа с кнопками управления стилями колонок
var styleButtonsGroup = addButtonGroup(
  columnStylesPanel, undefined, 
  Sizes.UI_TABLE_PANEL_WIDTH - Sizes.UI_COLUMN_PANEL_MARGIN * 2,
  {alignChildren: "left", alignment: "fill"}
);

// Кнопки управления таблицей стилей
var loadFileButton = addButton(styleButtonsGroup, localize(Lang.OPEN_FILE_BUTTON), 70);
var saveFileButton = addButton(styleButtonsGroup, localize(Lang.SAVE_FILE_BUTTON), 80);
var upStyleButton = addButton(styleButtonsGroup, localize(Lang.UP_BUTTON), Sizes.UI_BUTTON_SIZE);
var downStyleButton = addButton(styleButtonsGroup, localize(Lang.DOWN_BUTTON), Sizes.UI_BUTTON_SIZE);
var clearStyleButton = addButton(styleButtonsGroup, localize(Lang.CLEAR_BUTTON), 75);


// ============================================
// Правая колонка
var column2 = window.add("group");
  column2.orientation = "column";
  column2.margins = Sizes.UI_COLUMN_PANEL_MARGIN;

// Панель с колонками и scrollbar
var columnPanel = column2.add("panel");
  columnPanel.text = localize(Lang.COLUMNS_PANEL_HEAD);
  columnPanel.orientation = "column";
  columnPanel.alignChildren = "left";
  columnPanel.margins = Sizes.UI_COLUMN_PANEL_MARGIN;
  columnPanel.maximumSize.width = getWidthScrollGroup(Sizes.UI_COLUMN_PANEL_COUNT) + Sizes.UI_COLUMN_PANEL_MARGIN * 2;
  columnPanel.minimumSize.width = getWidthScrollGroup(Sizes.UI_COLUMN_PANEL_COUNT) + Sizes.UI_COLUMN_PANEL_MARGIN * 2;

// Группа с колонками 
var columnsScrollGroup = columnPanel.add("group");
  columnsScrollGroup.orientation = "row";
  // columnsScrollGroup.preferredSize.height = Sizes.UI_SCROLL_GROUP_HEIGHT;
  columnsScrollGroup.preferredSize.height = 97;
  columnsScrollGroup.preferredSize.width = getWidthScrollGroup(5);
  columnsScrollGroup.spacing = Sizes.UI_SCROLL_GROUP_SPACING;

// scrollbar колонок таблицы
var scrollBar = columnPanel.add("scrollbar");
  scrollBar.orientation = "horizontal";
  scrollBar.size = [
    getWidthScrollGroup(Sizes.UI_COLUMN_PANEL_COUNT), 
    Sizes.UI_SCROLL_HEIGHT
  ];
  scrollBar.enabled = false;
  scrollBar.visible = false; // прячем scrollbar на CS5

// Группа кнопок АВТО
var autoButtonsGroup = addButtonGroup(
  columnPanel, 0, 0, {alignment: "left"});
// Кнопка Все авто ВКЛ
var allAutoButton = addButton(autoButtonsGroup, localize(Lang.ALL_AUTO_BUTTON));
// Кнопка все авто ВЫКЛ
var allAutoOffButton = addButton(autoButtonsGroup, localize(Lang.ALL_AUTO_OFF_BUTTON));

// Группа Сохранить/Удалить стиль
var saveStyleButtonsGroup = addButtonGroup(
  columnPanel, 0, 0, {alignment: "left"});
// Кнопка "Сохранить стиль"
var saveStyleButton = addButton(saveStyleButtonsGroup, localize(Lang.SAVE_STYLE_BUTTON));
// Новое имя
var newStyleName = saveStyleButtonsGroup.add("edittext");
newStyleName.preferredSize = [
  Sizes.UI_NEW_NAME_WIDTH, 
  Sizes.UI_EDIT_HEIGHT
];
// Кнопка "Удалить стиль"
var deleteStyleButton = addButton(saveStyleButtonsGroup, localize(Lang.DELETE_STYLE_BUTTON));

// Группа кнопок Считать, Применить
var tableButtonsGroup = addButtonGroup(
  column2, undefined, 
  Sizes.UI_TABLE_PANEL_WIDTH - Sizes.UI_COLUMN_PANEL_MARGIN * 2,
  {alignment: "left"});
// Кнопка "Считать" таблицу в текущий стиль
var readTableButton = addButton(tableButtonsGroup, localize(Lang.READ_TABLE_BUTTON));
// Кнопка "Применить" текущий стиль к таблице
var applyButton = addButton(tableButtonsGroup, localize(Lang.APPLY_STYLE_BUTTON));

window.show();


// ============================================
// Функции UI
/**
 * Создаем кнопку.
 * @param {*} target - контейнер где создаем кнопку,
 * @param {String} orient - имя кнопки, текст на ней,
 * @param {Number} width - ширина кнопки,
 * @returns {Button} - возвращает экземпляр кнопки.
 */
function addButton(target, name, width) {
  var button = target.add("button", undefined, name);
  button.preferredSize.height = Sizes.UI_BUTTON_SIZE;
  if (width) {
    button.preferredSize.width = width;
  }
  return button;
}

/**
 * Создаем группу для кнопок.
 * @param {*} target - контейнер где создаем группу,
 * @param {String} orient - ориентация дочерних элементов "row" | "column",
 * @param {Number} width - ширина группы,
 * @returns {Group} - возвращает экземпляр группы.
 */
function addButtonGroup(target, orient, width, property) {
  var group = target.add("group");
  group.orientation = orient === "column" ? orient : "row";
  group.margins = 0;
  if (group.orientation === "row") {
    group.preferredSize.height = Sizes.UI_BUTTON_SIZE;
  }
  if (width) {
    group.preferredSize.width = width;
  }

  if (typeof property === "object") {
    for (var key in property) {
      group[key] = property[key];
    }
  }
  return group;
}

/**
 * Создаем ячейку для редактирования каждой из колонок.
 * @param {*} target - контейнер где создаем ячейку,
 * @param {String} item - имя отображаемое вверху панели,
 * @returns {object} - возвращает объект с UI элементами для редактирования.
 */
function addControlColumn(target, item, currentWidth, editWidth, auto) {
  var ITEM_WIDTH = Sizes.UI_COLUMN_WIDTH - Sizes.UI_COLUMN_MARGIN * 2;

  var columnPanel = target.add("panel");
  columnPanel.text = item;
  columnPanel.orientation = "column";
  columnPanel.preferredSize = [Sizes.UI_COLUMN_WIDTH, Sizes.UI_COLUMN_WIDTH];
  columnPanel.margins = Sizes.UI_COLUMN_MARGIN;
  columnPanel.margins.top = 10;
  columnPanel.spacing = Sizes.UI_COLUMN_ITEMS_SPACING;

  var currentWidthLine = columnPanel.add("statictext");
  currentWidthLine.text = parseFloat(currentWidth).toFixed(3);
  currentWidthLine.preferredSize = [ITEM_WIDTH, Sizes.UI_TEXT_HEIGHT];

  var inputFieldWidth = columnPanel.add("edittext");
  inputFieldWidth.text = editWidth ? parseFloat(editWidth).toFixed(3) : parseFloat(currentWidth).toFixed(3);
  inputFieldWidth.preferredSize = [ITEM_WIDTH, Sizes.UI_EDIT_HEIGHT];

  inputFieldWidth.onChange = function () {
    currentStyle = updateStyle(currentStyle.id);
  };

  var checkAuto = columnPanel.add("checkbox", undefined, localize(Lang.CHECK_AUTO));
  checkAuto.value = auto ? true : false;
  checkAuto.preferredSize = [ITEM_WIDTH, Sizes.UI_TEXT_HEIGHT];

  checkAuto.onClick = function () {
    currentStyle = updateStyle(currentStyle.id);
  };

  return {
    item: item,
    currentWidth: currentWidthLine,
    editWidth: inputFieldWidth,
    auto: checkAuto,
  }
}

// ============================================
// Конструкторы
/**
 * Конструктор одиночной колонки.
 * @param {String} item - номер колонки,
 * @param {String|Number} width - ширина колонки,
 * @param {Boolean} auto - авто ширина.
 */
function SingleColumn(item, width, auto) {
  this.type = "SingleColumn";
  this.item = item;
  this.width = parseFloat(width);
  this.auto = auto ? true : false;
}

/**
 * Конструктор стиля ширины колонок.
 * @param {String} name - имя стиля,
 * @param {Number} id - ID стиля,
 * @param {Array[SingleColumn]} columnList - массив с объектами одиночных колонок SingleColumn.
 */
function ColumnStyle(id, name, columns) {
  this.type = "ColumnStyle";
  this.id = id; // ID стиля
  this.name = name; // название стиля
  this.units = getCurrentUnits();

  if (columns) {
    if (columns.constructor.name !== "Array") {
      throw new TypeError("Error add Array Columns in ColumnStyle");
    }
    this.columns = columns; // массив SingleColumn
    this.length = columns.length; // количество колонок

    this.autoCount = 0; // количество автоколонок
    this.fixedWidth = 0; // сумма ширины фиксированных колонок
    // заполняем эти поля
    for (var i = 0; i < columns.length; i++) {
      if (columns[i].auto) this.autoCount += 1;
      else this.fixedWidth += columns[i].width;
    }
  }
}

// ============================================
// Функции
/**
 * Получаем ID последнего стиля из массива стилей.
 * @param {Array[ColumnStyle]} styleArray - глобальный массив со стилями колонок.
 * @returns {Number} возвращает последний (максимальный) ID стиля.
 */
function getLastStyleID(styleArray) {
  if (styleArray === undefined || styleArray.constructor.name !== "Array" || styleArray.length === 0) {
    return -1;
  }
  
  var maxID = -1;
  for (var i = 0; i < styleArray.length; i++) {
    maxID = styleArray[i].id > maxID ? styleArray[i].id : maxID;
  }
  return maxID;
}

/**
 * Новый ID для стиля колонок.
 * @param {Number} lastID - ID последнего стиля.
 * @returns {Number} возвращает новый ID.
 */
function getNewStyleID(lastID) {
  return lastID + 1;
}

/**
 * Создаем стиль колонок из контролов.
 * @param {Array} targetList - массив с контролами.
 * @returns {ColumnStyle} возвращаем созданный ColumnStyle.
 */
function createStyle() {
  var currentColumnList = getSingleColumnList();
  var styleID = getNewStyleID(getLastStyleID(styleList));
  return new ColumnStyle(styleID, encodeURI(newStyleName.text.trim()), currentColumnList);
}

/**
 * Обновляем стиль колонок из контролов по ID.
 * @param {Number} id - ID обновляемого стиля.
 * @returns {ColumnStyle} возвращаем обновленный ColumnStyle.
 */
function updateStyle(id) {
  var currentColumnList = getSingleColumnList();
  return new ColumnStyle(id, encodeURI(newStyleName.text.trim()), currentColumnList);
}

/**
 * Получаем массив SingleColumn из контролов.
 * @returns {Array[SingleColumn]} возвращаем массив SingleColumn.
 */
function getSingleColumnList() {
  var currentColumnList = [];
  for (var i = 0; controlsList.length > i; i++) {
    var currentColumn = new SingleColumn(
      controlsList[i].item,
      controlsList[i].editWidth.text.replace(/[,]+/, '.'),
      controlsList[i].auto.value
    );
    currentColumnList.push(currentColumn);
  }
  return currentColumnList;
}


// ============================================
// Вспомогательные функции
/**
 * Вычисляет ширину группы с ячейками "ControlColumn" для скроллинга.
 * @param {Number} cellCount - количество ячеек в группе,
 * @returns {Number} - ширина группы в px.
 */
function getWidthScrollGroup(cellCount) {
  return (Sizes.UI_COLUMN_WIDTH + 4) * cellCount + Sizes.UI_SCROLL_GROUP_SPACING * (cellCount - 1) + 3;
}

/**
 * Очищает группу для скроллинга.
 * @param {Group} target - целевая группа для очистки.
 */
function clearScrollGroup(target) {
  for (var i = target.children.length; i > 0; i--) {
    target.remove(i - 1);
  }
}

/**
 * Обновляем счетчики колонок и стилей.
 * @param {*} target - целевая панель.
 * @param {*} type - тип панели "columns" или "styles".
 * @param {Array} array - массив колонок.
 */
function updateCounter(target, type, array) {
  var string = type == "columns" ? localize(Lang.COLUMNS_PANEL_HEAD) : localize(Lang.STYLE_PANEL_HEAD);

  if (array === undefined || array.constructor.name !== "Array" || array.length === 0) {
    target.text = string;
  } else {
    target.text = string + ": " + array.length;
  }
}

/**
 * Очистить все элементы управления
 */
function clearAll() {
  currentStyle = null; // очищаем текущий стиль
  controlsList = []; // очищаем массив контролов
  newStyleName.text = ""; // очищаем поле ввода имени
  // обновляем счетчик колонок
  updateCounter(columnPanel, "columns");
  // очищаем скролл-группу
  clearScrollGroup(columnsScrollGroup);
  // выключаем scrollbar
  scrollBarOnOff(scrollBar);
}

/**
 * Получаем из выделения таблицу.
 * @returns {Table|Cell} - выделенная (часть) таблицы или null.
 */
function getTable() {
  if (app.documents.length === 0) {
    return null;
  }

  var select = app.activeDocument.selection[0];
  var table = null;

  if (select) {
    switch (select.constructor.name) {
      case "Cell":
      case "Row":
      case "Table":
        var table = select;
        break;
      case "InsertionPoint":
      case "Character":
      case "Word":
      case "Text":
      case "Paragraph":
        var table = select.parent.parent;
        break;
    }
  }

  if (table &&
    (table.constructor.name == "Cell" ||
      table.constructor.name == "Row" ||
      table.constructor.name == "Table")) {
    return table;
  } else {
    return null;
  }
}

/**
 * Получаем текущие единицы измерения на горизонтальной оси.
 * @returns {String} строка с типом единиц измерения.
 */
function getCurrentUnits() {
  var hmu = app.activeDocument.viewPreferences.horizontalMeasurementUnits;
  var currentUnits = null;
  switch (hmu) {
    case MeasurementUnits.MILLIMETERS: currentUnits = "mm"; break;
    case MeasurementUnits.CENTIMETERS: currentUnits = "cm"; break;
    case MeasurementUnits.POINTS: currentUnits = "pt"; break;
    case MeasurementUnits.PIXELS: currentUnits = "px"; break;
    case MeasurementUnits.INCHES:
    case MeasurementUnits.INCHES_DECIMAL: currentUnits = "in"; break;
    case MeasurementUnits.AGATES: currentUnits = "ag"; break;
    case MeasurementUnits.CICEROS: currentUnits = "ci"; break;
    case MeasurementUnits.PICAS: currentUnits = "pc"; break;
  }
  return currentUnits;
}

/**
 * Конвертируем единицы измерения.
 * @param {Number} value - входное значение,
 * @param {String} units - исходные единицы измерения,
 * @param {String} outUnits - выходные единицы измерения.
 * @returns {String} новое значение в outUnits единицах измерения.
 */
function convertUnit(value, units, outUnits) {
  return UnitValue(value, units).as(outUnits);
}

/**
 * Сохраняем файл конфигурации.
 * @param {File} file - файл конфигурации,
 * @param {Object} newConfig - объект конфигурации. 
 */
function saveConfig(file, newConfig) {
  var defaultConfig = {
    windowLocation: null,
    styleList: [],
  };

  if (newConfig === undefined) {
    saveFile(file, defaultConfig.toSource());
  } else {
    var lastConfig = eval(readFile(file));
    if (newConfig.toSource() !== lastConfig.toSource()) {
      saveFile(file, newConfig.toSource());
    }
  }
}

/**
 * Получаем путь к папке, где расположен скрипт, 
 * учитывая возможность запуска из ExtendScript Debugger.
 * @return {String} путь к папке в виде строки.
 */
function getScriptFolderPath() {
  try {
    // при запуске в отладчике, возникает исключение 
    return app.activeScript.path;
  }
  catch (error) {
    return File(error.fileName).path;
  }
}

/**
 * Читаем файл конфигурации.
 * @param {File} file - файл конфигурации.
 * @return {Object} конфигурация. 
 */
function readConfig(file) {
  var defaultConfig = {
    windowLocation: null,
    styleList: [],
  };

  var read = eval(readFile(file));
  // простейшая валидация настроек
  if (typeof read !== "object" ||
    !(read.hasOwnProperty("windowLocation") &&
      read.hasOwnProperty("styleList"))) {
    read = defaultConfig;
    saveConfig(file);
  }
  return read;
}

/**
 * Сохраняем файл.
 * @param {File} file - сохраняемый файл.
 * @param {String} content - текстовое содержимое файла.
 */
function saveFile(file, content) {
  file.open("w");
  file.write(content);
  file.close();
}

/**
 * Читаем файл.
 * @param {File} file - читаемый файл.
 * @return {String} текстовое содержимое файла.
 */
function readFile(file) {
  file.open("r");
  var content = file.read();
  file.close();
  return content;
}

/**
 * Проверяет поля ввода на корректные значения.
 * @param {Array} array - массив с контролами.
 * @return {Boolean|String} Возвращает текст ошибки или false, если ошибок нет.
 */
function checkEditsError(array) {
  if (array === undefined || array.constructor.name !== "Array" || array.length === 0) {
    return false;
  }

  var error = "";
  for (var i = 0; i < array.length; i++) {
    // меняем разделители в виде запятой, на точку
    var value = array[i].editWidth.text.replace(/[,]+/, '.');
    if (isNaN(parseFloat(value))) {
      error += localize(Lang.ERROR_EDIT_IN_COLUMN) + array[i].item + ": " + "\"" + value + "\"" + localize(Lang.ERROR_EDIT_BAD_VALUE) + "\n";
    }
  }

  if (error) return localize(Lang.ERROR_EDIT_VALUE) + error;
  else return false;
}

/**
 * Применяем текущий стиль к выбранной таблице.
 * @param {Table|Cell} table - выбранная таблица или ее часть.
 * @returns {ColumnStyle} возвращаем созданный ColumnStyle.
 */
function applyStyle(table) {
  // выключаем перерисовку во время изменения таблицы
  app.scriptPreferences.enableRedraw = false;

  var allWidth = table.width;
  var columns = table.columns;
  if (currentStyle.autoCount > 0) {
    var autoWidth = (allWidth - currentStyle.fixedWidth) / currentStyle.autoCount;
  } else {
    var autoWidth = 0;
  }

  for (i = 0; i < columns.length; i++) {
    if (currentStyle.length === i) break;

    if (!currentStyle.columns[i].auto) {
      columns[i].width = currentStyle.columns[i].width;
    }
    else {
      if (autoWidth > 0) columns[i].width = autoWidth;
    }
  }
  // включаем обратно
  app.scriptPreferences.enableRedraw = true;
}

/**
 * Возвращаем индекс стиля из массива стилей по ID.
 * @param {Number} id - искомый ID.
 * @returns {Number} индекс массива, если не найден то -1.
 */
function getIndexStyleByID(id) {
  for (var i = 0; i < styleList.length; i++) {
    if (styleList[i].id === id) return i;
  }
  return -1;
}

/**
 * Добавляем новый ListItem в таблицу стилей.
 * @param {Group} target - целевая группа, куда добавляем,
 * @param {ColumnStyle} style - текущий стиль колонок.
 * @returns {ListItem} возвращаем созданный ListItem.
 */
function addStyleItem(target, style) {
  var newItem = target.add("item", style);
  newItem.text = decodeURI(style.name);
  newItem.subItems[0].text = style.length;
  newItem.id = style.id;
  return newItem;
}

/**
 * Включаем/отключаем scrollbar.
 * @param {Scrollbar} target - Scrollbar группы скроллинга.
 */
function scrollBarOnOff(target) {
  if (!currentStyle) {
    target.enabled = false;
    target.visible = false;
    return;
  }
  if (currentStyle.length > Sizes.UI_COLUMN_PANEL_COUNT) {
    target.enabled = true;
    target.visible = true; // для старых InDesign
    target.value = 0; // перемещаем ползунок в начало
  } else {
    target.enabled = false;
    target.visible = false;
  }
}

// ============================================
// События
/**
 * Считываем выделенную таблицу в текущий стиль.
 */
readTableButton.onClick = function () {
  // очищаем группу от старых ячеек
  clearScrollGroup(columnsScrollGroup);
  // снимаем выделение 
  // (срабатывает событие columnStylesTable.onChange)
  tapFlag = true;
  columnStylesTable.selection = null;
  tapFlag = false;

  var table = getTable(); // текущая таблица
  if (table) {
    var singleColumnsList = []; // массив с SingleColumn
    controlsList = [];
    var columns = table.columns;
    // Записываем колонки в группу и массив с контролами
    for (i = 0; i < columns.length; i++) {
      controlsList.push(addControlColumn(
        columnsScrollGroup, 
        i + 1, 
        columns[i].width,
        columns[i].width,
        false
      ));
      // Записываем массив с SingleColumn
      singleColumnsList.push(new SingleColumn(i + 1, columns[i].width, false));
    }
    
    var styleID = getNewStyleID(getLastStyleID(styleList));
    currentStyle = new ColumnStyle(styleID, localize(Lang.NEW_STYLE_NAME) + styleID, singleColumnsList);

    updateCounter(columnPanel, "columns", singleColumnsList);
    scrollBarOnOff(scrollBar);
    // записываем имя стиля в поле ввода нового имени
    newStyleName.text = currentStyle.name;
  
    // Все записали и изменили, перерисовываем окно.
    window.layout.layout(true);
  } else {
    clearAll();
  }
};

/**
 * Применить текущий стиль к таблице.
 */
applyButton.onClick = function () {
  if (!currentStyle) {
    return;
  }
  
  var error = checkEditsError(controlsList);
  if (error) {
    alert(error, ", ".join(Script.NAME, Script.COPY, Script.VERSION));
    return;
  }

  var table = getTable(); // текущая таблица
  if (table) {
    // applyStyle(table);
    app.doScript(applyStyle, ScriptLanguage.JAVASCRIPT, table, UndoModes.FAST_ENTIRE_SCRIPT, Script.NAME + " > Apply Style >" + decodeURI(currentStyle.name));
  }
}

/**
 * Все Авто
 */
allAutoButton.onClick = function () {
  setAllAuto(true);
}

/**
 * Все Авто выкл.
 */
allAutoOffButton.onClick = function () {
  setAllAuto(false);
}

/**
 * Устанавливаем все Checkbox в значение value.
 * @param {Boolean} value - включаем (true) / выключаем (false).
 */
function setAllAuto(value) {
  for (var i = 0; i < controlsList.length; i++) {
    controlsList[i].auto.value = value;
  }
}

/**
 * Сохранить текущий стиль.
 */
saveStyleButton.onClick = function () {
  if (!currentStyle) {
    return;
  }
  var error = checkEditsError(controlsList);
  if (error) {
    alert(error, ", ".join(Script.NAME, Script.COPY, Script.VERSION));
    return;
  }

  var index = getIndexStyleByID(currentStyle.id);
  if (index >= 0) {
    // если такой стиль есть в таблице, сохраняем его
    currentStyle = updateStyle(currentStyle.id);
    currentStyle.name = encodeURI(newStyleName.text.trim());
    styleList[index] = currentStyle;
    columnStylesTable.items[index].text = newStyleName.text.trim();
    
    tapFlag = true;
    // HACK Если сначала не сбросить выделение, позже не срабатывает columnStylesTable.active = true, и обновления не видны в таблице
    columnStylesTable.selection = null; 
    columnStylesTable.selection = index; // выделяем этот стиль
    tapFlag = false;

  } else {
    // иначе создаем новый
    addStyleItem(columnStylesTable, currentStyle);
    currentStyle.name = encodeURI(newStyleName.text.trim());
    styleList.push(createStyle());
    updateCounter(columnStylesPanel, "styles", styleList);
    
    tapFlag = true;
    columnStylesTable.selection = null; // сбрасываем старое выделение
    columnStylesTable.selection = styleList.length - 1; // выделяем этот стиль
    tapFlag = false;
  }
  columnStylesTable.active = true; // HACK активируем таблицу, чтобы сразу видеть обновленные записи
};

/**
 * Удалить текущий стиль.
 */
deleteStyleButton.onClick = function () {
  if (columnStylesTable.selection === null || 
      styleList.length === 0) {
    return;
  }
  // индекс выделенного стиля
  var killStyleIndex = columnStylesTable.selection.index;
  
  columnStylesTable.remove(killStyleIndex); // убираем стиль из таблицы
  styleList.splice(killStyleIndex, 1); // убираем стиль из массива
  
  clearAll(); // все очищаем
  updateCounter(columnStylesPanel, "styles", styleList); // обновляем счетчик стилей
  
  // снимаем выделение
  tapFlag = true;
  columnStylesTable.selection = null;
  tapFlag = false;
};

/**
 * Обновляем текущий стиль при изменении имени.
 */
newStyleName.onChange = function () {
  currentStyle = updateStyle(currentStyle.id);
}

/**
 * Считываем выбранный стиль в контролы.
 */
columnStylesTable.onChange = function () {
  // выходим, если нажали кнопку Вверх/Вниз
  if (tapFlag) return;

  if (columnStylesTable.selection !== null) {
    clearScrollGroup(columnsScrollGroup);
    // если в таблице выделен стиль
    currentStyle = styleList[columnStylesTable.selection.index];
    controlsList = []; // очищаем список контролов

    if (app.documents.length === 0) {
      var currentUnits = currentStyle.units;
    } else {
      var currentUnits = getCurrentUnits();
    }
    // и заполняем новыми из стиля
    for (var i = 0; i < currentStyle.length; i++) {
      var currentWidth = convertUnit(currentStyle.columns[i].width, currentStyle.units, currentUnits);
      
      controlsList.push(addControlColumn(
        columnsScrollGroup,
        currentStyle.columns[i].item,
        currentWidth,
        currentWidth,
        currentStyle.columns[i].auto,
      ));
    }
    columnsScrollGroup.size.width = getWidthScrollGroup(currentStyle.length);
    scrollBarOnOff(scrollBar);
    newStyleName.text = decodeURI(currentStyle.name);
    updateCounter(columnPanel, "columns", currentStyle.columns);
  
  } else {
    clearAll(); // если ничего не выделено, все очищаем
  }
  window.layout.layout(true);
}

/**
 * Поднять стиль в списке.
 */
upStyleButton.onClick = function () {
  tapFlag = true;
  if (columnStylesTable.selection !== null) {
    var n = columnStylesTable.selection.index;
    if (n > 0) {
      swapLineStyles(columnStylesTable.items[n - 1], columnStylesTable.items[n]);
      columnStylesTable.selection = n - 1;
      // перемещаем стили массиве
      styleList.splice(n - 1, 2, styleList[n], styleList[n - 1]);
    }
  }
  tapFlag = false;
}

/**
 * Опустить стиль в списке.
 */
downStyleButton.onClick = function () {
  tapFlag = true;
  if (columnStylesTable.selection !== null) {
    var n = columnStylesTable.selection.index;
    if (n < columnStylesTable.items.length - 1) {
      swapLineStyles(columnStylesTable.items[n], columnStylesTable.items[n + 1]);
      columnStylesTable.selection = n + 1;
      // перемещаем стили массиве
      styleList.splice(n, 2, styleList[n + 1], styleList[n]);
    }
  }
  tapFlag = false;
}

/**
 * Меняем местами стили в таблице.
 * @param {ListItem} x - первый элемент,
 * @param {ListItem} y - второй элемент.
 */
function swapLineStyles(x, y) {
  var tempID = x.id;
  var tempName = x.text;
  var tempLength = x.subItems[0].text;

  x.id = y.id;
  x.text = y.text;
  x.subItems[0].text = y.subItems[0].text;

  y.id = tempID;
  y.text = tempName;
  y.subItems[0].text = tempLength;
}

/**
 * Очистить таблицу
 */
clearStyleButton.onClick = function () {
  if (styleList.length > 0) {
    columnStylesTable.removeAll(); // очищаем таблицу
    clearAll();
    styleList = [];
    updateCounter(columnStylesPanel, "styles", styleList); // обновляем счетчик стилей
  }
}

/**
 * Работа скроллбара
 */
scrollBar.onChanging = function () {
  columnsScrollGroup.location.x = Sizes.UI_COLUMN_PANEL_MARGIN + -this.value / 100 * (getWidthScrollGroup(currentStyle.length) - getWidthScrollGroup(Sizes.UI_COLUMN_PANEL_COUNT));
}

/**
 * Закрываем окно и сохраняем конфиг.
 */
window.onClose = function () {
  config.windowLocation = [window.location[0], window.location[1]];
  config.styleList = styleList;
  // сохраняем все стили в файл конфигурации
  saveConfig(Script.CONFIG_FILE, config);
}

/**
 * Загрузить файл со стилями.
 */
loadFileButton.onClick = function () {
  // Читаем файл со стилями
  var file = File.openDialog(localize(Lang.OPEN_DIALOG), Script.TYPE_FILE);
  if (file) {
    styleList = eval(readFile(file));
    
    clearAll(); // очищаем все колонки
    columnStylesTable.removeAll(); // очищаем таблицу
    // Заполняем таблицу новыми стилями
    for (var i = 0; styleList.length > i; i++) {
      addStyleItem(columnStylesTable, styleList[i]);
    }
    updateCounter(columnStylesPanel, "styles", styleList);
  }
}

/**
 * Сохранить файл со стилями.
 */
saveFileButton.onClick = function () {
  if (styleList.length === 0) {
    alert(localize(Lang.EMPTY_STYLE_LIST), ", ".join(Script.NAME, Script.COPY, Script.VERSION));
    return;
  }

  var file = File.saveDialog(localize(Lang.SAVE_DIALOG), Script.TYPE_FILE);
  if (file) {
    saveFile(file, styleList.toSource())
  }
}
