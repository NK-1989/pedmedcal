// script.js (最終確定版 - カテゴリ重複完全排除済み)

document.addEventListener('DOMContentLoaded', function() {
    setEventListeners();
    initializeApp();
});

// **** 医療安全：体重範囲定数 ****
const MIN_WEIGHT = 1.5;
const MAX_WEIGHT = 50.0;
// ****

// **** 薬剤データ定義 (最終確定データ - ユーザー提出内容) ****
const DRUG_DATA = [
    // 形式: { category, name, code, conc_mg_mL, target_dose, target_unit, start_dose, min_dose, max_dose, [stock_note] }
    // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // 心血管作動薬
    { category: '心血管作動薬', name: 'ドブタミン100mg/5mL', code: 'DobutamineH', conc_mg_mL: 20.0, target_dose: 5.0, target_unit: 'ug/kg/min', start_dose: 5.0, min_dose: 2.0, max_dose: 10.0 },
    { category: '心血管作動薬', name: 'ドブタミン0.3%シリンジ', code: 'DobutamineL', conc_mg_mL: 3.0, target_dose: 5.0, target_unit: 'ug/kg/min', start_dose: 5.0, min_dose: 2.0, max_dose: 10.0 },
    { category: '心血管作動薬', name: 'ドパミン100mg/5mL', code: 'DopamineH', conc_mg_mL: 20.0, target_dose: 5.0, target_unit: 'ug/kg/min', start_dose: 5.0, min_dose: 2.0, max_dose: 10.0 },
    { category: '心血管作動薬', name: 'イノバン0.3%シリンジ', code: 'DopamineL', conc_mg_mL: 3.0, target_dose: 5.0, target_unit: 'ug/kg/min', start_dose: 5.0, min_dose: 2.0, max_dose: 10.0 },
    { category: '心血管作動薬', name: 'ノルアドレナリン1mg/mL', code: 'Noradrenaline', conc_mg_mL: 1.0, target_dose: 0.05, target_unit: 'ug/kg/min', start_dose: 0.05, min_dose: 0.01, max_dose: 1.0 },
    { category: '心血管作動薬', name: 'アドレナリン1mg/mL', code: 'Adrenaline', conc_mg_mL: 1.0, target_dose: 0.05, target_unit: 'ug/kg/min', start_dose: 0.05, min_dose: 0.01, max_dose: 0.1 },
    { category: '心血管作動薬', name: 'ミルリノン10mg/10mL', code: 'Millinon', conc_mg_mL: 1.0, target_dose: 0.5, target_unit: 'ug/kg/min', start_dose: 0.5, min_dose: 0.25, max_dose: 1.0 },
    { category: '心血管作動薬', name: 'ニカルジピン', code: 'Nicardipine', conc_mg_mL: 1.0, target_dose: 1.0, target_unit: 'ug/kg/min', start_dose: 1.0, min_dose: 0.5, max_dose: 2.0 }, 
    { 
        category: '心血管作動薬', name: 'アルプロスタジルアルファデックス(PGE1-CD)', code: 'PGE1CD', 
        conc_mg_mL: 0.02, target_dose: 50.0, target_unit: 'ng/kg/min',
        start_dose: 50.0, min_dose: 10.0, max_dose: 200.0,
        stock_note: '1Vを生食 1mL で溶解' 
    },
    { category: '心血管作動薬', name: 'パルクス(Lipo-PGE1)', code: 'LipoPGE1', conc_mg_mL: 0.005, target_dose: 5.0, target_unit: 'ng/kg/min', start_dose: 5.0, min_dose: 2.0, max_dose: 10.0 },
    { category: '心血管作動薬', name: 'ピトレシン20U', code: 'Vasopresin', conc_mg_mL: 20.0, target_dose: 0.4, target_unit: 'mU/kg/min', start_dose: 0.4, min_dose: 0.2, max_dose: 1.0 },
    
    // 鎮静薬
    { category: '鎮静薬', name: '10kg以上：ミダゾラム', code: 'Midazolamb10', conc_mg_mL: 5.0, target_dose: 0.1, target_unit: 'mg/kg/hr', start_dose: 0.1, min_dose: 0.05, max_dose: 0.2 },
    { category: '鎮静薬', name: '10kg未満：ミダゾラム', code: 'Midazolamu10', conc_mg_mL: 5.0, target_dose: 0.2, target_unit: 'mg/kg/hr', start_dose: 0.2, min_dose: 0.05, max_dose: 0.2 },
    
    // 鎮痛薬
    { category: '鎮痛薬', name: '10kg以上：フェンタニル', code: 'Fentanylb10', conc_mg_mL: 0.05, target_dose: 1.0, target_unit: 'ug/kg/hr', start_dose: 1.0, min_dose: 0.5, max_dose: 2.0 },
    { category: '鎮痛薬', name: '10kg未満：フェンタニル', code: 'Fentanylu10', conc_mg_mL: 0.05, target_dose: 2.0, target_unit: 'ug/kg/hr', start_dose: 2.0, min_dose: 1.0, max_dose: 2.0 },
    { category: '鎮痛薬', name: '10kg以上：モルヒネ', code: 'Morphineb10', conc_mg_mL: 10.0, target_dose: 20.0, target_unit: 'ug/kg/hr', start_dose: 20.0, min_dose: 10.0, max_dose: 80.0 },
    { category: '鎮痛薬', name: '10kg未満：モルヒネ', code: 'Morphineu10', conc_mg_mL: 10.0, target_dose: 40.0, target_unit: 'ug/kg/hr', start_dose: 40.0, min_dose: 20.0, max_dose: 80.0 },
    
    // 筋弛緩薬
    { category: '筋弛緩薬', name: '10kg未満：ロクロニウム', code: 'Rocuroniumu10', conc_mg_mL: 10.0, target_dose: 10.0, target_unit: 'ug/kg/min', start_dose: 10.0, min_dose: 0, max_dose: 10.0 },
    { category: '筋弛緩薬', name: '10-30kg：ロクロニウム', code: 'Rocuronium1030', conc_mg_mL: 10.0, target_dose: 5.0, target_unit: 'ug/kg/min', start_dose: 5.0, min_dose: 0, max_dose: 10.0 },
    { category: '筋弛緩薬', name: '30kg以上：ロクロニウム', code: 'Rocuroniumb30', conc_mg_mL: 10.0, target_dose: 3.0, target_unit: 'ug/kg/min', start_dose: 3.0, min_dose: 0, max_dose: 10.0 },
    
    // 利尿薬
    { category: '利尿薬', name: 'フロセミド', code: 'Furosemide', conc_mg_mL: 10.0, target_dose: 10.0, target_unit: 'mg/kg/day', start_dose: 10.0, min_dose: 5.0, max_dose: 10.0 }
];

// **** 単位換算設定 (変更なし) ****
const UNIT_CONVERSION = {
    'ug/kg/min': { mass_op: 'MUL', mass_val: 1, time_val: 1, isMassUnit: true, output_unit: 'ug/mL' },
    'ug/kg/hr': { mass_op: 'MUL', mass_val: 1, time_val: 60, isMassUnit: true, output_unit: 'ug/mL' },
    'ng/kg/min': { mass_op: 'DIV', mass_val: 1000, time_val: 1, isMassUnit: true, output_unit: 'ug/mL' }, 
    'mg/kg/hr': { mass_op: 'MUL', mass_val: 1000, time_val: 60, isMassUnit: true, output_unit: 'ug/mL' },
    'mg/kg/day': { mass_op: 'MUL', mass_val: 1000, time_val: 1440, isMassUnit: true, output_unit: 'ug/mL' },
    'U/kg/min': { mass_op: 'MUL', mass_val: 1, time_val: 1, isMassUnit: false, output_unit: 'U/mL' },
    'mU/kg/min': { mass_op: 'DIV', mass_val: 1000, time_val: 1, isMassUnit: false, output_unit: 'U/mL' }, 
    'U/kg/hr': { mass_op: 'MUL', mass_val: 1, time_val: 60, isMassUnit: false, output_unit: 'U/mL' },
    'U/kg/h': { mass_op: 'MUL', mass_val: 1, time_val: 60, isMassUnit: false, output_unit: 'U/mL' },
};

const MINUTES_PER_HOUR = 60;
const MICROGRAMS_PER_MILLIGRAM = 1000;

// 小数点以下の桁数を取得するヘルパー関数 (変更なし)
function getDecimalPlaces(value) {
    const text = value.toString();
    const decimalIndex = text.indexOf('.');
    return decimalIndex === -1 ? 0 : text.length - decimalIndex - 1;
}

// ---------------------------------------------------------
// DOM操作と初期化
// ---------------------------------------------------------

function setEventListeners() {
    try {
        document.getElementById('calculateButton').addEventListener('click', calculateDilutionVolume);
        document.getElementById('categorySelect').addEventListener('change', populateDrugSelect);
        document.getElementById('drugSelect').addEventListener('change', updateFixedDoseDisplay);
    } catch (e) {
        console.error("Critical DOM Initialization Error: An ID was not found.", e);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setEventListeners();
    initializeApp();
});


function initializeApp() {
    const categorySelect = document.getElementById('categorySelect');
    if (!categorySelect) return; 

    // ★★★ 修正済みロジック: trim()で重複を完全に排除 ★★★
    const categories = [...new Set(DRUG_DATA.map(d => d.category.trim()))];
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
    
    if (categories.length > 0) {
        categorySelect.value = categories[0];
    }
    populateDrugSelect();
}

// カテゴリ選択に基づいて薬剤リストを更新
function populateDrugSelect() {
    const categorySelect = document.getElementById('categorySelect');
    const drugSelect = document.getElementById('drugSelect');
    if (!categorySelect || !drugSelect) return;

    const selectedCategory = categorySelect.value.trim(); // 選択カテゴリをtrim()
    drugSelect.innerHTML = ''; // リセット

    const filteredDrugs = DRUG_DATA.filter(d => d.category.trim() === selectedCategory); // データ側をtrim()して比較
    
    filteredDrugs.forEach(drug => {
        const option = document.createElement('option');
        option.value = drug.code;
        const concUnit = drug.target_unit.includes('U') || drug.target_unit.includes('mU') ? 'U/mL' : 'mg/mL';
        option.textContent = `${drug.name} (${drug.conc_mg_mL} ${concUnit})`;
        drugSelect.appendChild(option);
    });
    
    updateFixedDoseDisplay(); 
}

// 目標表示と投与範囲を更新
function updateFixedDoseDisplay() {
    const drugSelect = document.getElementById('drugSelect');
    const displayElement = document.getElementById('drugTargetDisplay'); 
    if (!drugSelect || !displayElement) return;

    const selectedCode = drugSelect.value;
    if (!selectedCode) {
        displayElement.textContent = '目標: 1 mL/hr = 薬剤を選択してください';
        return;
    }
    
    const drug = DRUG_DATA.find(d => d.code === selectedCode);
    
    if (drug) {
        // 調整範囲と開始量の表示ロジック
        let doseRange = '';
        if (drug.min_dose !== undefined && drug.max_dose !== undefined) {
             doseRange = ` (${drug.min_dose}〜${drug.max_dose} ${drug.target_unit})`;
        }

        let startDoseDisplay = '';
        if (drug.start_dose !== undefined) {
             startDoseDisplay = `<br><span style="color: #00796b; font-weight: normal;">開始量: ${drug.start_dose} ${drug.target_unit}</span>`;
        }
        
        // target_dose は「1 mL/hr 投与時に相当する速度」として表示
        let displayHtml = `目標: 1 mL/hr = **${drug.target_dose} ${drug.target_unit}** (${drug.name})${doseRange}${startDoseDisplay}`;
        
        // stock_noteが存在する場合、注意書きを追加表示
        if (drug.stock_note) {
            displayHtml += `<br><span style="color: #e53935; font-size: 0.9em;">(原液作成指示: ${drug.stock_note})</span>`;
        }
        
        displayElement.innerHTML = displayHtml;
    } else {
        displayElement.textContent = '目標: 1 mL/hr = 薬剤を選択してください';
    }
}


// **** 偶数丸めの関数 (小数点第1位の偶数丸め) ****
function roundToEvenFirstDecimal(value) {
    const roundedValue = Math.round(value * 10) / 10;
    const firstDecimal = Math.round(roundedValue * 10) % 10;
    
    if (firstDecimal % 2 !== 0) {
        return (Math.ceil((value + 0.05) * 10) / 10);
    }
    return roundedValue;
}
// **********************************

// ---------------------------------------------------------
// 計算ロジック
// ---------------------------------------------------------

function calculateDilutionVolume() {
    // 1. 入力値と選択値の取得
    const weightKg = parseFloat(document.getElementById('weightKg').value);
    const selectedCode = document.getElementById('drugSelect').value;
    
    if (!selectedCode) {
        document.getElementById('errorMessage').textContent = "⚠️ 薬剤を選択してください。";
        return;
    }

    const drug = DRUG_DATA.find(d => d.code === selectedCode);
    const totalVolumeMl = parseFloat(document.querySelector('input[name="totalVolume"]:checked').value);

    // 2. 結果出力要素とラベルの取得
    const drugVolumeOutput = document.getElementById('drugVolumeMl');
    const diluentVolumeOutput = document.getElementById('diluentVolumeMl');
    const trueDoseOutput = document.getElementById('trueDoseOutput');
    const errorRateOutput = document.getElementById('errorRateOutput');
    const errorMessage = document.getElementById('errorMessage');
    const drugVolumeLabel = document.getElementById('drugVolumeLabel'); 
    
    // 3. 必要な桁数の決定
    const targetDecimals = drug ? getDecimalPlaces(drug.target_dose) : 0;
    const displayDecimals = targetDecimals + 1;


    // 結果とエラーメッセージをリセット
    drugVolumeOutput.textContent = '-- mL';
    diluentVolumeOutput.textContent = '-- mL';
    trueDoseOutput.textContent = '--';
    errorRateOutput.textContent = '-- %';
    errorMessage.textContent = '';
    
    const finalConcUnit = drug ? (drug.target_unit.includes('U') || drug.target_unit.includes('mU') ? 'U/mL' : 'mg/mL') : 'mg/mL';
    drugVolumeLabel.textContent = `必要な溶質 (${drug ? drug.name : '未選択'}, ${drug ? drug.conc_mg_mL : '--'} ${finalConcUnit}):`;


    // 3. エラーハンドリング
    if (isNaN(weightKg) || weightKg <= 0) {
        errorMessage.textContent = "⚠️ 体重を正しく入力してください。（0kg以下は不可）";
        return;
    }
    
    // 体重範囲チェック
    if (weightKg < MIN_WEIGHT || weightKg > MAX_WEIGHT) {
        errorMessage.textContent = `⚠️ 体重は${MIN_WEIGHT} kgから${MAX_WEIGHT} kgの範囲で入力してください。`;
        return;
    }

    const conversion = UNIT_CONVERSION[drug.target_unit];
    if (!conversion) {
        errorMessage.textContent = "⚠️ 選択された薬剤の投与単位が未定義です。開発者に確認してください。";
        return;
    }

    // 4. 理想的な薬剤量（丸め前）の計算
    
    // 4-1. 薬剤の目標速度をベース単位(ug/minまたはU/min)に変換
    let baseDoseRate;
    if (conversion.mass_op === 'MUL') {
        baseDoseRate = (drug.target_dose * conversion.mass_val) / conversion.time_val;
    } else {
        baseDoseRate = (drug.target_dose / conversion.mass_val) / conversion.time_val; // ng/mUの場合は除算
    }

    // 4-2. 理想濃度 C の計算: C (ug/mL or U/mL) = (Base Dose Rate * Weight * 60 min) / 1 mL/hr
    const targetConcentrationFinalUnitMl = (baseDoseRate * weightKg * MINUTES_PER_HOUR);

    let calculatedDrugVolumeMl; // 丸め前の理想溶質量

    if (conversion.isMassUnit) {
        // 質量単位 (ug, ng, mg) の場合: 最終濃度 C (ug/mL) を C (mg/mL) に換算
        
        const requiredDrugAmountUg = targetConcentrationFinalUnitMl * totalVolumeMl; // 必要な総ug
        
        const requiredDrugAmountMg = requiredDrugAmountUg / MICROGRAMS_PER_MILLIGRAM; // 必要な総mgに換算
        
        calculatedDrugVolumeMl = requiredDrugAmountMg / drug.conc_mg_mL; // 溶質mLを計算
    } else {
        // U/mU 単位の場合: 製剤濃度 (U/mLと仮定) を使用
        const requiredDrugAmountUnit = targetConcentrationFinalUnitMl * totalVolumeMl;
        calculatedDrugVolumeMl = requiredDrugAmountUnit / drug.conc_mg_mL; 
    }
    
    // 5. 偶数丸めと最終結果
    const drugVolumeMl = roundToEvenFirstDecimal(calculatedDrugVolumeMl);
    const diluentVolumeMl = totalVolumeMl - drugVolumeMl;

    // 6. 制限事項チェック
    if (drugVolumeMl > totalVolumeMl) {
        drugVolumeOutput.textContent = 'エラー';
        diluentVolumeOutput.textContent = 'エラー';
        
        let requiredVolume = calculatedDrugVolumeMl.toFixed(1);
        errorMessage.textContent = `⚠️ 総容量 (${totalVolumeMl} mL) 超過！ 目標濃度を達成するには約 ${requiredVolume} mLの溶質が必要です。総容量を増やすか、設定を見直してください。`;
        return;
    }

    // **********************************************
    // 7. 誤差計算
    // **********************************************

    // 7-1. 実際に調剤される薬剤総量 (丸め後の溶質量から逆算)
    let actualDrugAmount;
    if (conversion.isMassUnit) {
        actualDrugAmount = drugVolumeMl * drug.conc_mg_mL * MICROGRAMS_PER_MILLIGRAM; // 最終的に ug 単位
    } else {
        actualDrugAmount = drugVolumeMl * drug.conc_mg_mL; // 最終的に U 単位
    }
    
    // 7-2. 真の最終濃度 (丸め後の総量から逆算)
    const actualConcentrationFinalUnitMl = actualDrugAmount / totalVolumeMl;
    
    // 7-3. 真の投与速度 (元の単位に戻す)
    
    const trueDoseNumerator = actualConcentrationFinalUnitMl;
    const trueDoseDenominator = weightKg * MINUTES_PER_HOUR;
    const trueBaseRate = trueDoseNumerator / trueDoseDenominator; 

    // 元の目標単位に戻す: True Dose = Base Rate * Time_Factor * Mass_Factor
    let trueDoseFinalUnit;
    if (conversion.mass_op === 'MUL') {
        trueDoseFinalUnit = trueBaseRate * conversion.time_val / conversion.mass_val; // ug/minなど
    } else {
        trueDoseFinalUnit = trueBaseRate * conversion.time_val * conversion.mass_val; // ng/minなど
    }

    // 7-4. 誤差率の計算
    const errorPercentage = ((trueDoseFinalUnit - drug.target_dose) / drug.target_dose) * 100;
    
    // 8. 結果の表示
    drugVolumeOutput.textContent = `${drugVolumeMl.toFixed(1)} mL`;
    diluentVolumeOutput.textContent = `${diluentVolumeMl.toFixed(1)} mL`;
    
    trueDoseOutput.innerHTML = `${trueDoseFinalUnit.toFixed(displayDecimals)} ${drug.target_unit}`;
    errorRateOutput.innerHTML = `${errorPercentage.toFixed(2)} %`; 
    
    const errorColor = (Math.abs(errorPercentage) > 5) ? 'red' : 'green'; 
    errorRateOutput.style.color = errorColor;

    // U/mU使用時の警告
    if (!conversion.isMassUnit) {
        errorMessage.textContent = `計算は製剤濃度がU/mLであることを前提に行われています。`;
    } else {
        errorMessage.textContent = '';
    }
}
