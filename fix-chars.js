const fs = require('fs');
const path = require('path');

const replacements = {
    'Nobetci eczane': 'Nöbetçi eczane',
    'nobetci eczane': 'nöbetçi eczane',
    'hizli erisim': 'hızlı erişim',
    'icin aktif': 'için aktif',
    'Tum sehirler': 'Tüm şehirler',
    'Sehirden hizli giris': 'Şehirden hızlı giriş',
    'Nobetci verileri': 'Nöbetçi verileri',
    'kaynağından cekilir': 'kaynağından çekilir',
    'kisa araliklarla': 'kısa aralıklarla',
    'aktif nobetci listesinden': 'aktif nöbetçi listesinden',
    'en yakin eczaneyi siralar': 'en yakın eczaneyi sıralar',
    'kisa sureli onbellekle hizli': 'kısa süreli önbellekle hızlı',
    'donusturur': 'dönüştürür',
    'kamuya acik sayfalardan': 'kamuya açık sayfalardan',
    'icerik stratejisi nasil birlikte calisir': 'içerik stratejisi nasıl birlikte çalışır',
    'kullanabilecegin pratik adimlar': 'kullanabileceğin pratik adımlar',
    'vakit kaybetmemek icin': 'vakit kaybetmemek için',
    'sorgusuna hizli cevap verilir': 'sorgusuna hızlı cevap verilir',
    'danismanlik': 'danışmanlık',
    'nobetci-': 'NOBETCITOKEN',
    '/nobetci': 'NOBETCISLASH',
    '"nobetci"': 'NOBETCIQUOTE',
    'nobetci ': 'nöbetçi ',
    ' nobetci': ' nöbetçi',
    'Nobetci ': 'Nöbetçi ',
    'hizli ': 'hızlı ',
    ' hizli': ' hızlı',
    'Hizli ': 'Hızlı ',
    'NOBETCITOKEN': 'nobetci-',
    'NOBETCISLASH': '/nobetci',
    'NOBETCIQUOTE': '"nobetci"'
};

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('c:/Users/e_can/Web/Eczane/src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    for (const [key, value] of Object.entries(replacements)) {
        content = content.split(key).join(value);
    }

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file);
    }
});
