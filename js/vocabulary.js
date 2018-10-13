/* eslint-disable */


const vocEn = [
    ["a", "aaa"],
    ["b", "bbb"],
    ["Запоминать состояния", "Enable Storage"],
    ["Шаблон Подсказки", "Tooltip Template"],
    ["Состояние подсказки", "Tooltip Show Mode"],
    ["Приколотое расположение", "Pinned Positioning"],
    ["Масштабирование окна подсказки", "Tooltip Window Zoom Factor"],
    ["Задержка показа на входе", "Delay In"],
    ["Задержка показа на выходе", "Delay Out"],
    ["Время показа", "Delay On"],
    ["Непрозрачность", "Opacity"],
    ["Цвет фона окна подсказки", "Tooltip Window Background Color"],
    ["Цвет обводки окна подсказки", "Tooltip Window Border Color"],
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
    ["Цвет фона строк легенды", "Legend Background Color"],
    ["Цвет обводки строк легенды", "Legend Border Color"],
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
    ["Параметры интерфейса диаграммы", "Pie UI Parameters"],
    ["Основные параметры индикатора", "Gauge Main Parameters"],
    ["Параметры интерфейса индикатора", "Gauge UI Parameters"],
    ["Настроить параметры виджета SmartTooltip", "SmartTooltip Widget Parameters"],
    ["Настроить параметры виджета SmartPie", "SmartPie Widget Parameters"],
    ["Настроить параметры виджета SmartGauge", "SmartGauge Widget Parameters"],
    ["Настроить oсновные параметры", "Edit main parameters"],
    ["Настроить параметры интерактивности", "Edit timing (mouse activity) parameters"],
    ["Настроить параметры окна подсказки", "Edit Tooltip Window Parameters"],
    ["Настроить параметры заголовка", "Edit Title Parameters"],
    ["Настроить параметры легенды", "Edit Legend Parameters"],
    ["Настроить параметры шрифтов", "Edit all texts parameters, such as: font family, font sizes, colors, ..."],
    ["Настроить основные параметры круговой диаграммы, такие как тип, вид, сортировки и углы", "Edit UI parameters of SmartPie widget"],
    ["Настроить параметры интерфейса, такие как фонт, цвет, размер и т.д.", "Edit main parameters of SmartPie"],
    ["Настроить параметры индикатора, такие как тип, вид стрелок, количество шкал и др.", "Edit UI parameters of SmartGauge widget"],
    ["Настроить параметры интерфейса, такие как фонт, цвет, размер и др.", "Edit main parameters of SmartGauge widget"],
    ["Простой", "Simple"],
    ["Диаграмма", "Pie"],
    ["Картинка", "Image"],
    ["Плавающее", "Floating"],
    ["Приколотое", "Pinned"],
    ["Зафиксированное", "Fixed"],
    ["Справа Сверху", "Right Top"],
    ["Справа Снизу", "Right Bottom"],
    ["Слева Снизу", "Left Bottom"],
    ["Слева Сверху", "Left Top"],
    ["Слева", "Left"],
    ["По центру", "Center"],
    ["Справа", "Right"],
    ["Выровнено", "Justify"],
    ["Не сортировать", "No sorting"],
    ["По алфавиту", "Alphabetically"],
    ["По значению", "By Value"],
    ["По цвету", "By Color"],
    ["По состоянию", "By State"],
    ["Просто подсказка", "Just a simple tooltip. May contains any text. You may specify it in parameter 'Title Format String'" ],
    ["Круговая диаграмма", "Draws flat pie diagramm for an array of targets"],
    ["Картинка!", "If you want to show any picture, you may use this template"],
    ["Ссылка на ресурс", "Any external link may be shown by this type of template"],
    ["Показать параметры для Web component", "Show definitions for Web-component"],
    ["Показать параметры в JSON-формате", "Show definitions in JSON-format"],
    ["Показать параметры в виде JavaScript объекта", "Show definitions as Javascript object"],
    ["Показать SVG представление сконфигурированного виджета", "Show SVG representation of the configured widget"],
    ["SmartTooltip это продвинутый виджет, позволяющий реализовать отображение подсказок на веб странице. Умеет автоматически регистрироваться,на лету подстраивается под контекст, умеет отображать несколько шаблонов и имеет простой API.",
      "SmartTooltip is an advanced widget that allows you to display hints on a web page. It can automatically register, adapts itself to the context on the fly, can display several templates and has a simple API."],
    ["Изменяйте параметры виджета, наводите курсор указателя мыши на выделенные слова и проверяйте поведение окна подсказки.", "Change the parameters of the widget, move the mouse cursor over the selected words and check the behavior of the tooltip window."],
    ["По окончании настройки, скопируйте параметры", "You may copy the definitions of widget"],
    ["виджета в нижней части экрана, в требуемом", "at any time at the bottom of the screen."],
    ["вам формате.", " "]
];

class Vocabulary {
    constructor() {
        this.voc = new Map(vocEn);
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
window.vocabulary = vocabulary;

const _ = function(a) {
    return vocabulary.translate(a) || a;
}

// usage
_("a"); //returns "aaa"
