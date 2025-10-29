const API_BASE = 'https://rbx-analytics-service.cubiodojo.workers.dev';


const ctx = document.getElementById('timeseriesChart').getContext('2d');
let chart = new Chart(ctx, {
type: 'line',
data: { labels: [], datasets: [{ label: 'value', data: [], tension: 0.2, fill: true }] },
options: { scales: { x: { type: 'time', time: { tooltipFormat: 'HH:mm' } } } }
});


async function fetchSeries(name, type, minutes) {
const url = `${API_BASE}/query?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}&minutes=${encodeURIComponent(minutes)}`;
const res = await fetch(url);
if (!res.ok) throw new Error('Failed to fetch');
return res.json();
}


function transformSeries(raw, type) {
const labels = raw.series.map(s => s.bucket);
const values = raw.series.map(s => {
const v = s.value;
if (!v) return 0;
if (type === 'counter') return v.count || 0;
if (type === 'gauge') return v.value || 0;
if (type === 'timer') return v.count ? (v.sum / v.count) : 0;
return 0;
});
return { labels, values };
}


async function refresh() {
const name = document.getElementById('metricName').value.trim();
const type = document.getElementById('metricType').value;
const minutes = document.getElementById('minutes').value;
if (!name) return alert('Enter a metric name');
try {
const raw = await fetchSeries(name, type, minutes);
const { labels, values } = transformSeries(raw, type);
chart.data.labels = labels;
chart.data.datasets[0].data = values;
chart.update();
// update summary
const sum = values.reduce((a,b)=>a+b,0);
const avg = values.length ? (sum/values.length).toFixed(2) : 0;
document.getElementById('summary').innerText = `Sum: ${sum}, Avg: ${avg}`;
} catch (e) {
console.error(e);
alert('Error fetching data');
