const vocRu_En = [
    ["a", "aaa"],
    ["b", "bbb"],
    ["Запоминать состояния", "Enable Storage"],
    ["Шаблон Подсказки", "Tooltip Template"],
    ["Состояние", "Show Mode"],
    ["Расположение", "Position"],
    ["Масштабирование окна подсказки", "Tooltip Window Zoom Factor"],
    ["Задержка показа на входе", "Delay In"],
    ["Задержка показа на выходе", "Delay Out"],
    ["Время показа", "Delay On"],
    ["Непрозрачность", "Opacity"],
    ["Цвет фона", "Background Color"],
    ["Цвет обводки", "Border Color"],
    ["Толщина обводки", "Border Width"],
    ["Скругление углов", "Border Radius"],
    ["Отбрасывание тени", "Enable Shadow"],
    ["Ширина окна подсказки", "Tooltip Max Width"],
    ["Ширина выравнивания заголовка", "Title Wrap Width"],
    ["Форматирование заголовка", "Title Format String"],
    ["Выравнивание заголовка", "Title Align"],
    ["Ширина выравнивания описания", "Description Wrap Width"],
    ["Форматирование описания", "Description Format String"],
    ["Выравнивание описания", "Description Align"],
    ["Форматирование легенды", "Legend Format String"],
    ["Форматирование значения", "Value Format String"],
    ["Цвет фона", "Legend Background Color"],
    ["Цвет обводки", "Legend Border Color"],
    ["Сортировка легенды по параметру", "Sorting Legend By Parameter"],
    ["Направление сортировки", "Sorting Direction"],
    ["Семейство шрифтов", "Font Family"],
    ["Ширина начертания шрифта", "Font Stretch"],
    ["Размер шрифта", "Default Font Size"],
    ["Цвет шрифта", "Font Color"],
    ["Размер шрифта заголовка", "Title Font Size"],
    ["Размер шрифта описания", "Description Font Size"],
    ["Размер шрифта легенды", "Legend Font Size"],
    ["Размер шрифта шкалы", "Scale Font Size"],
    ["Основные характеристики", "Main Parameters"],
    ["Временные характеристики", "Titming (Mouse Activity"],
    ["Параметры окна подсказки", "Tooltip Window Parameters"],
    ["Параметры отображения заголовка", "Title Parameters"],
    ["Параметры отображения легенды", "Legend Parameters"],
    ["Настройки шрифтов", "All Texts Parameters"],
    ["Основные характеристики диаграммы", "Pie Main Parameters"],
    ["Параметры интерфейса диаграммы", "Pai UI Parameters"],
    ["Основные параметры индикатора", "Gauge Main Parameters"], 
    ["Параметры интерфейса индикатора", "Gauge UI Parameters"],
    ["Настроить параметры виджета SmartTooltip", "SmartTooltip Widget Parameters"],
    ["Настроить параметры виджета SmartPie", "SmartPie Widget Parameters"],
    ["Настроить параметры виджета SmartGauge", "SmartGauge Widget Parameters"]
];

class Vocabulary {
    constructor() {
        this.voc = new Map(vocRu_En);
        this.lang = document.firstElementChild.attributes.lang.value || 'ru';
    }
    setLanguage(lang) {
        this.lang = lang;
        // refresh...
    }
    translate(str) {
        if (this.lang == 'ru') {
            return str;
        }
        return this.voc.get(str) || str;
    }
}
const vocabulary = new Vocabulary();
const _ = function(a) {
    return vocabulary.translate(a) || a; 
}

// usage
_("a"); //returns "aaa"