// js/modules/navigation.js

let _sections = {};
let _navButtons = {};

export const initNavigation = (sections, navButtons) => {
    _sections   = sections;
    _navButtons = navButtons;
};

export const showSection = (sectionKey) => {
    Object.values(_sections).forEach(s => { if (s) s.style.display = 'none'; });
    Object.values(_navButtons).forEach(b => { if (b) b.classList.remove('active'); });
    if (_sections[sectionKey]) _sections[sectionKey].style.display = 'block';
    // 'allConsultations' → 'showAllConsultations'
    const btnKey = 'show' + sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);
    if (_navButtons[btnKey]) _navButtons[btnKey].classList.add('active');
};