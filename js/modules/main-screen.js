// js/modules/main-screen.js
import { supabase, SUPABASE_STORAGE_BUCKET } from '../supabase-client.js';

export const fetchMainScreenSettings = async () => {
    const imgUrlInput   = document.getElementById('currentMainScreenImageUrl');
    const viewImgLink   = document.getElementById('viewCurrentImageLink');
    const mottoUk       = document.getElementById('currentIntroMottoTextUk');
    const mottoEn       = document.getElementById('currentIntroMottoTextEn');

    const { data: img } = await supabase
        .from('app_settings').select('setting_value')
        .eq('setting_name', 'main_screen_image_url').single();
    if (img && imgUrlInput) {
        imgUrlInput.value = img.setting_value;
        if (viewImgLink) {
            viewImgLink.href = img.setting_value;
            viewImgLink.style.display = 'inline-block';
        }
    }

    const { data: ua } = await supabase
        .from('app_settings').select('setting_value')
        .eq('setting_name', 'intro_motto_text_uk').single();
    if (ua && mottoUk) mottoUk.value = ua.setting_value;

    const { data: en } = await supabase
        .from('app_settings').select('setting_value')
        .eq('setting_name', 'intro_motto_text_en').single();
    if (en && mottoEn) mottoEn.value = en.setting_value;
};

export const initMainScreen = () => {
    const imgForm     = document.getElementById('mainScreenImageForm');
    const imgInput    = document.getElementById('newMainScreenImage');
    const imgStatus   = document.getElementById('mainScreenImageStatus');
    const mottoForm   = document.getElementById('introMottoTextForm');
    const mottoUk     = document.getElementById('currentIntroMottoTextUk');
    const mottoEn     = document.getElementById('currentIntroMottoTextEn');
    const mottoStatus = document.getElementById('introMottoTextStatus');

    imgForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = imgInput?.files[0];
        if (!file) return;
        if (imgStatus) imgStatus.textContent = 'Завантаження...';

        const fileName = `main_screen_${Date.now()}_${file.name}`;
        const { error: upErr } = await supabase.storage
            .from(SUPABASE_STORAGE_BUCKET).upload(fileName, file);
        if (upErr) { if (imgStatus) imgStatus.textContent = upErr.message; return; }

        const { data: { publicUrl } } = supabase.storage
            .from(SUPABASE_STORAGE_BUCKET).getPublicUrl(fileName);
        await supabase.from('app_settings')
            .update({ setting_value: publicUrl })
            .eq('setting_name', 'main_screen_image_url');

        if (imgStatus) imgStatus.textContent = 'Оновлено!';
        fetchMainScreenSettings();
    });

    mottoForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await supabase.from('app_settings')
            .update({ setting_value: mottoUk?.value })
            .eq('setting_name', 'intro_motto_text_uk');
        await supabase.from('app_settings')
            .update({ setting_value: mottoEn?.value })
            .eq('setting_name', 'intro_motto_text_en');
        if (mottoStatus) mottoStatus.textContent = 'Текст оновлено!';
    });
};