// js/admin-dashboard.js  —  entry point
import { supabase } from './supabase-client.js';
import { initNavigation, showSection } from './modules/navigation.js';

import { fetchPatients }                            from './modules/patients.js';
import {
    fetchDoctors,
    fetchNewDoctorApplications,
    fetchNewDoctorApplicationsCount,
    initDoctorModal,
}                                                   from './modules/doctors.js';
import { fetchAllConsultations, initConsultations } from './modules/consultations.js';
import { fetchFaqsAdmin, initFaq }                  from './modules/faq.js';
import { fetchReviewsAdmin, initReviews }           from './modules/reviews.js';
import { fetchUserHelp, initUserHelp }              from './modules/user-help.js';
import { initNotifications }                        from './modules/notifications.js';
import { fetchMainScreenSettings, initMainScreen }  from './modules/main-screen.js';
import {
    fetchSpecializations,
    initSpecializations,
}                                                   from './modules/specializations.js';
import { initExport }                               from './modules/export.js';

document.addEventListener('DOMContentLoaded', async () => {

    // ── DOM references ────────────────────────────────────────────────────────

    const adminNameSpan         = document.getElementById('adminName');
    const adminCreationDateSpan = document.getElementById('adminCreationDate');
    const logoutButton          = document.getElementById('logoutButton');

    const navButtons = {
        showPatients:              document.getElementById('showPatients'),
        showDoctors:               document.getElementById('showDoctors'),
        showNewDoctorApplications: document.getElementById('showNewDoctorApplications'),
        showAllConsultations:      document.getElementById('showAllConsultations'),
        showNotifications:         document.getElementById('showNotifications'),
        showFaq:                   document.getElementById('showFaq'),
        showReviews:               document.getElementById('showReviews'),
        showUserHelp:              document.getElementById('showUserHelp'),
        showMainScreenSettings:    document.getElementById('showMainScreenSettings'),
        showExportData:            document.getElementById('showExportData'),
        showSpecializations:       document.getElementById('showSpecializations'),
    };

    const sections = {
        patients:              document.getElementById('patientsSection'),
        doctors:               document.getElementById('doctorsSection'),
        newDoctorApplications: document.getElementById('newDoctorApplicationsSection'),
        allConsultations:      document.getElementById('allConsultationsSection'),
        notifications:         document.getElementById('notificationsSection'),
        faq:                   document.getElementById('faqSection'),
        reviews:               document.getElementById('reviewsSection'),
        userHelp:              document.getElementById('userHelpSection'),
        mainScreenSettings:    document.getElementById('mainScreenSettingsSection'),
        exportData:            document.getElementById('exportDataSection'),
        specializations:       document.getElementById('specializationsSection'),
    };

    // ── Navigation ────────────────────────────────────────────────────────────

    initNavigation(sections, navButtons);

    // Map from sectionKey → loader function
    const sectionLoaders = {
        patients:              fetchPatients,
        doctors:               () => fetchDoctors(),
        newDoctorApplications: fetchNewDoctorApplications,
        allConsultations:      fetchAllConsultations,
        faq:                   fetchFaqsAdmin,
        reviews:               fetchReviewsAdmin,
        userHelp:              fetchUserHelp,
        mainScreenSettings:    fetchMainScreenSettings,
        specializations:       fetchSpecializations,
        notifications:         () => {},   // no auto-load needed
        exportData:            () => {},
    };

    Object.keys(navButtons).forEach(key => {
        const btn = navButtons[key];
        if (!btn) return;
        // 'showAllConsultations' → 'allConsultations'
        const sectionKey = key.replace(/^show/, '').replace(/^./, c => c.toLowerCase());
        btn.addEventListener('click', () => {
            // Hide modals when switching section
            const doctorModal = document.getElementById('doctorDetailsModal');
            const replyModal  = document.getElementById('replyModal');
            if (doctorModal) doctorModal.style.display = 'none';
            if (replyModal)  replyModal.style.display  = 'none';

            showSection(sectionKey);
            sectionLoaders[sectionKey]?.();
        });
    });

    // ── Module inits ──────────────────────────────────────────────────────────

    initDoctorModal();
    initConsultations();
    initFaq();
    initReviews();
    initUserHelp();
    initNotifications();
    initMainScreen();
    initSpecializations();
    initExport();

    // ── Modals: close on ×  or backdrop click ─────────────────────────────────

    document.querySelectorAll('.close-button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('doctorDetailsModal')
                && (document.getElementById('doctorDetailsModal').style.display = 'none');
            document.getElementById('replyModal')
                && (document.getElementById('replyModal').style.display = 'none');
        });
    });

    window.addEventListener('click', e => {
        const doctorModal = document.getElementById('doctorDetailsModal');
        const replyModal  = document.getElementById('replyModal');
        if (e.target === doctorModal) doctorModal.style.display = 'none';
        if (e.target === replyModal)  replyModal.style.display  = 'none';
    });

    // ── Auth ──────────────────────────────────────────────────────────────────

    logoutButton?.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'index.html';
    });

    const checkAdminStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { window.location.href = 'index.html'; return; }

        const { data: adminProfile, error } = await supabase
            .from('profiles_admin').select('*').eq('user_id', user.id).single();

        if (error || !adminProfile) {
            alert('Немає прав доступу.');
            await supabase.auth.signOut();
            window.location.href = 'index.html';
            return;
        }
        if (adminNameSpan)
            adminNameSpan.textContent = adminProfile.full_name;
        if (adminCreationDateSpan)
            adminCreationDateSpan.textContent =
                `(${new Date(adminProfile.created_at).toLocaleDateString('uk-UA')})`;

        fetchNewDoctorApplicationsCount();
    };

    // ── Boot ──────────────────────────────────────────────────────────────────

    // Hide all sections; show patients by default
    Object.values(sections).forEach(s => { if (s) s.style.display = 'none'; });
    if (sections.patients)           sections.patients.style.display = 'block';
    if (navButtons.showPatients)     navButtons.showPatients.classList.add('active');

    // Ensure modals are hidden on load (CSS handles it too)
    ['doctorDetailsModal', 'replyModal'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    await checkAdminStatus();
    await fetchPatients();
});