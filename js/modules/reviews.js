// js/modules/reviews.js
import { supabase } from '../supabase-client.js';

export const fetchReviewsAdmin = async () => {
    const tbody = document.getElementById('reviewsListAdmin');
    if (!tbody) return;
    tbody.innerHTML = '';
    const { data } = await supabase
        .from('app_reviews').select('*').order('created_at', { ascending: false });
    if (!data?.length) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Відгуків немає.</td></tr>';
        return;
    }
    data.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.id}</td>
            <td>${r.user_name}</td>
            <td>${r.rating}★</td>
            <td>${r.description}</td>
            <td><button class="delete-btn" data-id="${r.id}">🗑</button></td>`;
        tbody.appendChild(tr);
    });
};

export const initReviews = () => {
    document.getElementById('reviewsListAdmin')
        ?.addEventListener('click', async e => {
            if (!e.target.classList.contains('delete-btn')) return;
            if (!confirm('Видалити відгук?')) return;
            await supabase.from('app_reviews').delete().eq('id', e.target.dataset.id);
            fetchReviewsAdmin();
        });
};