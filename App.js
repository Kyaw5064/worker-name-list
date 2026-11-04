import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, SectionList, TouchableOpacity, TextInput, Modal, ScrollView, Alert,
  StatusBar, Linking, SafeAreaView, KeyboardAvoidingView, Platform, Share, Switch,
  LayoutAnimation, UIManager, AppState,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  try { UIManager.setLayoutAnimationEnabledExperimental(true); } catch (e) {}
}

/* ===================== THEME ===================== */
const C = {
  bg: '#0A0A12', card: '#151522', card2: '#1D1D2E', line: '#2A2A40',
  text: '#F5F5FA', muted: '#8C8CA8', amber: '#FFB020', violet: '#A78BFA',
  pink: '#FF5C8A', green: '#34D399', cyan: '#22D3EE', red: '#F87171', yellow: '#FDE047',
};
const KEY = 'betagro_roster_v1';

/* ===================== ATTENDANCE ===================== */
const STATUS = {
  absent: { icon: 'close-circle', color: '#F87171', code: 'A' },
  leave: { icon: 'document-text', color: '#FB923C', code: 'L' },
  off: { icon: 'bed', color: '#60A5FA', code: 'O' },
  late: { icon: 'alarm', color: '#E879F9', code: 'LT' },
  present: { icon: 'checkmark-circle', color: '#34D399', code: 'P' },
  none: { icon: 'ellipse-outline', color: '#8C8CA8', code: '' },
};
const ORDER = ['absent', 'leave', 'off', 'late', 'present', 'none'];
const SEG = ['present', 'absent', 'leave', 'off', 'late'];
const LTYPES = ['sick', 'personal', 'annual', 'maternity', 'other'];
const LT_ICON = { sick: 'medkit', personal: 'briefcase', annual: 'airplane', maternity: 'heart', other: 'ellipsis-horizontal' };

/* ===================== UI TEXT (3 LANG) ===================== */
const T = {
  mm: {
    title: 'အလုပ်သမားစာရင်း', sub: 'Betagro • နခွန်ပထုံ ဝက်သတ်ရုံ', s1: 'ဆိုင်း ၁', s2: 'ဆိုင်း ၂',
    day: 'မနက်ဆိုင်း', night: 'ညနေ/ညဆိုင်း', search: 'နာမည် သို့ ID ဖြင့်ရှာပါ...', all: 'အားလုံး',
    busR: 'ရာဘာစက်ရုံကား', busP: 'ငါးဆိပ်ကား', moved: 'ဆိုင်းပြောင်း', preg: 'ကိုယ်ဝန်ဆောင်', lead: 'ခေါင်းဆောင်',
    total: 'စုစုပေါင်း', ppl: 'ယောက်', job: 'တာဝန်', time: 'အလုပ်ချိန်', id: 'ဝန်ထမ်းနံပါတ်', bus: 'ကားလိုင်း',
    noBus: 'ကိုယ်တိုင်လာ', new: 'အသစ်', leaveM: 'မီးဖွားခွင့်', from1: 'ဆိုင်း၁ မှ ပြောင်းလာ', from2: 'ဆိုင်း၂ မှ ပြောင်းလာ',
    notice: 'စည်းကမ်းနှင့် ဆက်သွယ်ရန်', callShift: 'ဆိုင်းခေါင်းဆောင်', callLine: 'လိုင်းခေါင်းဆောင်',
    vStatus: 'တက်ရောက်မှုအလိုက်', vJob: 'တာဝန်အလိုက်', vList: 'စာရင်းအတိုင်း',
    pinTitle: 'Admin PIN ထည့်ပါ', pinWrong: 'PIN မှားနေသည်',
    enter: 'ဝင်မည်', cancel: 'မလုပ်တော့', save: 'သိမ်းမည်', edit: 'ပြင်မည်', del: 'ဖျက်မည်',
    delQ: 'ဒီဝန်ထမ်းကို ဖျက်မှာ သေချာလား?', move: 'ဆိုင်းပြောင်း', add: 'ဝန်ထမ်းအသစ်ထည့်',
    nameTh: 'နာမည် (ထိုင်း)', nameMm: 'နာမည် (မြန်မာ)', nameEn: 'နာမည် (English)', shiftLbl: 'ဆိုင်း',
    noteLbl: 'အခြေအနေ', none: 'မရှိ', settings: 'Admin ဆက်တင်', newPin: 'PIN အသစ် (ပြောင်းချင်မှ ဖြည့်)',
    shiftSup: 'ဆိုင်းခေါင်းဆောင် ဖုန်း', lineSup: 'လိုင်းခေါင်းဆောင် ဖုန်း', empty: 'ရှာမတွေ့ပါ',
    required: 'ID နှင့် နာမည်တစ်ခုခု လိုအပ်သည်', yes: 'ဟုတ်ကဲ့', idExists: 'ဒီ ID ရှိပြီးသားပါ',
    names: 'နာမည် ၃ ဘာသာ', rulesLbl: 'စည်းကမ်း', logout: 'Admin မှ ထွက်မည်', saved: 'သိမ်းပြီးပါပြီ',
    adminMode: 'ADMIN MODE', jobAll: 'တာဝန် ၃ ဘာသာ', tapHint: 'ခလုတ်နှိပ်ပြီး မှတ်ပါ • နာမည်နှိပ်ပြီး OT/အသေးစိတ်',
    today: 'ယနေ့', attTitle: 'တက်ရောက်မှု', marked: 'မှတ်ပြီး', allPresent: 'ကျန်သူအားလုံး လာ',
    allPresentQ: 'မမှတ်ရသေးသူ အားလုံးကို "အလုပ်လာ" လို့ မှတ်မလား?', share: 'ပို့မည်', clearDay: 'ရှင်းမည်',
    clearDayQ: 'ဒီရက် ဒီဆိုင်းရဲ့ မှတ်ထားတာတွေ အကုန်ဖျက်မလား?', locked: 'Admin သာ တက်ရောက်မှု မှတ်နိုင်သည်',
    lockAtt: 'Admin သာ တက်ရောက်မှု မှတ်ခွင့်ရှိမည်', clearAll: 'တက်ရောက်မှု မှတ်တမ်းအားလုံး ဖျက်မည်',
    clearAllQ: 'ရက်အားလုံးရဲ့ တက်ရောက်မှု မှတ်တမ်း ပျက်မည်။ သေချာလား?', note: 'မှတ်ချက်',
    notePh: 'ဥပမာ – နေမကောင်း၊ ဆေးခန်းသွား...', month: 'ဒီလ စာရင်း', status: 'အခြေအနေ',
    nothing: 'မှတ်ရန် မရှိတော့ပါ', reportBy: 'အလုပ်သမားစာရင်း App',
    st: { present: 'အလုပ်လာ', absent: 'အလုပ်ပျက်', leave: 'ခွင့်ယူ', off: 'နား', late: 'နောက်ကျ', none: 'မမှတ်ရသေး' },
    sec: { present: 'အလုပ်လာသူ', absent: 'အလုပ်ပျက်သူ', leave: 'ခွင့်ယူသူ', off: 'နားသူ', late: 'နောက်ကျသူ', none: 'မမှတ်ရသေးသူ' },
    short: { present: 'လာ', absent: 'ပျက်', leave: 'ခွင့်', off: 'နား', late: 'နောက်ကျ' },
    wd: ['တနင်္ဂနွေ', 'တနင်္လာ', 'အင်္ဂါ', 'ဗုဒ္ဓဟူး', 'ကြာသပတေး', 'သောကြာ', 'စနေ'],
    wdS: ['နွေ', 'လာ', 'ဂါ', 'ဟူး', 'တေး', 'ကြာ', 'နေ'],
    report: 'လချုပ် Report', busList: 'ကားလိုင်း စာရင်း', riders: 'လိုက်မည့်သူ', noRiders: 'လိုက်မည့်သူ မရှိပါ',
    backup: 'Backup ထုတ်မည်', restore: 'Backup ပြန်သွင်းမည်', paste: 'စာသား paste ဖြင့် သွင်းမည်',
    importFile: 'ဖိုင်မှ သွင်းမည်', welcome: 'ဝန်ထမ်းစာရင်း မရှိသေးပါ',
    welcomeSub: 'ပေးထားတဲ့ စာရင်းဖိုင် (.json) ကို သွင်းပါ၊ ဒါမှမဟုတ် Admin ဝင်ပြီး ကိုယ်တိုင်ထည့်ပါ',
    importQ: 'ဝန်ထမ်း {w} ယောက်၊ မှတ်တမ်း {d} ရက် ပါပါတယ်။ လက်ရှိ data ကို အစားထိုးမလား?',
    badFile: 'ဖိုင်မှားနေပါတယ် (ဒီ app ရဲ့ backup ဖိုင် မဟုတ်ပါ)', imported: 'သွင်းပြီးပါပြီ',
    lastBackup: 'နောက်ဆုံး Backup', never: 'မလုပ်ရသေးပါ', daysAgo: 'ရက် အရင်က',
    backupRemind: 'Backup မလုပ်ရသေးတာ ကြာပြီ — နှိပ်ပြီး ယခုလုပ်ပါ', backupHint: 'Backup ဖိုင်ကို LINE Keep / Google Drive ထဲ သိမ်းထားပါ',
    leaveType: 'ခွင့်အမျိုးအစား',
    lt: { sick: 'ဖျားနာခွင့်', personal: 'ကိစ္စခွင့်', annual: 'နှစ်ပတ်လည်ခွင့်', maternity: 'မီးဖွားခွင့်', other: 'အခြား' },
    yearUse: 'ဒီနှစ် ခွင့်သုံးစွဲမှု', remain: 'ကျန်', quota: 'တစ်နှစ် ခွင့်ရက် (ရက်)',
    arrival: 'ရောက်ချိန်', lateBy: 'နောက်ကျ', min: 'မိနစ်', hrs: 'နာရီ',
    ot: 'OT', otIn: 'OT ဝင်ချိန်', otOut: 'OT ထွက်ချိန်', otTotal: 'OT စုစုပေါင်း', clearOt: 'OT ဖျက်',
    saveRec: 'မှတ်တမ်း သိမ်းမည်', badTime: 'အချိန်ပုံစံ မှားနေသည် (ဥပမာ 06:30)',
    warn: 'သတိ', warnTx: 'ဒီလ {n} ရက် ပျက်', warnLbl: 'သတိပေးမည့် ပျက်ရက် (တစ်လ)',
    calendar: 'ဒီလ ပြက္ခဒိန်', exportCsv: 'Excel (CSV) ထုတ်', shareTxt: 'စာသား ပို့',
    workDays: 'လုပ်ရက်', otHours: 'OT နာရီ', lateTotal: 'နောက်ကျ မိနစ်', shiftAll: 'ဆိုင်းအားလုံး',
    noData: 'ဒီလ မှတ်တမ်း မရှိသေးပါ', pastePh: 'Backup စာသားကို ဒီမှာ paste လုပ်ပါ', importBtn: 'သွင်းမည်',
    emptyAdmin: 'Admin ဝင်ပြီး ကိုယ်တိုင်ထည့်မည်', dataSec: 'Data နှင့် Backup', leaveSec: 'ခွင့်နှင့် သတိပေးချက်',
    contactSec: 'ဆက်သွယ်ရန် နှင့် စည်းကမ်း', secSec: 'လုံခြုံရေး', otQuick: 'OT အမြန်ထည့်',
    cloud: 'Cloud Sync (ဖုန်းများ မျှသုံး)', projectId: 'Supabase Project ID', apiKey: 'Publishable key',
    teamCode: 'အဖွဲ့ စကားဝှက် (အနည်းဆုံး ၈ လုံး)', connStr: 'ချိတ်ဆက်စာ paste (WNL1|...)', connect: 'ချိတ်ဆက်မည်',
    disconnect: 'ချိတ်ဆက်မှု ဖြုတ်မည်', shareConn: 'အဖွဲ့ဝင်ဖုန်းသို့ ချိတ်ဆက်စာ ပို့မည်', syncNow: 'ယခု Sync လုပ်မည်',
    syncOk: 'Sync ပြီး', syncBusy: 'Sync လုပ်နေသည်...', syncErr: 'Sync မအောင်မြင်ပါ', syncOff: 'Cloud မချိတ်ရသေး',
    lastSync: 'နောက်ဆုံး Sync', pending: 'မပို့ရသေးသော ပြင်ဆင်မှု', codeShort: 'စကားဝှက် အနည်းဆုံး ၈ လုံး ထားပါ',
    needAll: 'Project ID၊ key၊ စကားဝှက် အားလုံး ဖြည့်ပါ', connFail: 'Cloud ချိတ်ဆက်မရပါ',
    connFailHint: 'အင်တာနက်၊ key မှန်/မမှန်၊ Supabase မှာ SQL Run ပြီး/မပြီး စစ်ပါ',
    chooseQ: 'Cloud ပေါ်မှာ ဒီအဖွဲ့ရဲ့ data ရှိပြီးသားပါ။ ဘယ်ဟာကို သုံးမလဲ?', useCloud: 'Cloud data ယူမည်',
    useLocal: 'ဒီဖုန်း data တင်မည်', created: 'Cloud အဖွဲ့အသစ် ဖန်တီးပြီး data တင်ပြီးပါပြီ', connected: 'ချိတ်ဆက်ပြီးပါပြီ',
    shareWarn: 'ဒီစာထဲမှာ စကားဝှက်ပါလို့ အဖွဲ့ဝင်တွေကိုပဲ ပို့ပါ', cloudHint: 'ဖုန်းတိုင်းမှာ စကားဝှက်တူတူ ထည့်ရင် စာရင်းနဲ့ တက်ရောက်မှုကို မျှသုံးပါမယ်',
    connectedTo: 'ချိတ်ထားသည်', clearCloudQ: 'Cloud ပေါ်ကပါ ဖျက်ပါမယ်၊ ဖုန်းအားလုံးမှာ ပျက်ပါမယ်။',
  },
  th: {
    title: 'รายชื่อพนักงาน', sub: 'เบทาโกร • โรงฆ่าสุกรนครปฐม', s1: 'กะ 1', s2: 'กะ 2',
    day: 'กะเช้า', night: 'กะบ่าย-ดึก', search: 'ค้นหาชื่อหรือรหัส...', all: 'ทั้งหมด',
    busR: 'สายรถโรงยาง', busP: 'สายรถแพปลา', moved: 'ย้ายกะ', preg: 'ตั้งครรภ์', lead: 'หัวหน้า',
    total: 'ทั้งหมด', ppl: 'คน', job: 'จุดงาน', time: 'เวลาทำงาน', id: 'รหัสพนักงาน', bus: 'สายรถ',
    noBus: 'มาเอง', new: 'คนใหม่', leaveM: 'ลาคลอด', from1: 'ย้ายมาจากกะ 1', from2: 'ย้ายมาจากกะ 2',
    notice: 'ข้อปฏิบัติ & ติดต่อ', callShift: 'หัวหน้ากะ', callLine: 'หัวหน้าสาย',
    vStatus: 'ตามสถานะ', vJob: 'ตามจุดงาน', vList: 'ตามลำดับ',
    pinTitle: 'ใส่ PIN แอดมิน', pinWrong: 'PIN ไม่ถูกต้อง',
    enter: 'เข้าสู่ระบบ', cancel: 'ยกเลิก', save: 'บันทึก', edit: 'แก้ไข', del: 'ลบ',
    delQ: 'ยืนยันลบพนักงานคนนี้?', move: 'ย้ายกะ', add: 'เพิ่มพนักงาน',
    nameTh: 'ชื่อ (ไทย)', nameMm: 'ชื่อ (พม่า)', nameEn: 'ชื่อ (อังกฤษ)', shiftLbl: 'กะ',
    noteLbl: 'สถานะ', none: 'ไม่มี', settings: 'ตั้งค่าแอดมิน', newPin: 'PIN ใหม่ (ใส่เมื่อต้องการเปลี่ยน)',
    shiftSup: 'เบอร์หัวหน้ากะ', lineSup: 'เบอร์หัวหน้าสาย', empty: 'ไม่พบข้อมูล',
    required: 'ต้องมีรหัสและชื่ออย่างน้อยหนึ่งภาษา', yes: 'ยืนยัน', idExists: 'รหัสนี้มีอยู่แล้ว',
    names: 'ชื่อ 3 ภาษา', rulesLbl: 'ข้อปฏิบัติ', logout: 'ออกจากแอดมิน', saved: 'บันทึกแล้ว',
    adminMode: 'โหมดแอดมิน', jobAll: 'จุดงาน 3 ภาษา', tapHint: 'แตะปุ่มเพื่อเช็คชื่อ • แตะชื่อเพื่อ OT/รายละเอียด',
    today: 'วันนี้', attTitle: 'การมาทำงาน', marked: 'เช็คแล้ว', allPresent: 'ที่เหลือมาทั้งหมด',
    allPresentQ: 'บันทึกคนที่ยังไม่เช็คทั้งหมดเป็น "มาทำงาน"?', share: 'ส่งรายงาน', clearDay: 'ล้าง',
    clearDayQ: 'ลบการเช็คชื่อของกะนี้ในวันนี้ทั้งหมด?', locked: 'เฉพาะแอดมินเท่านั้นที่เช็คชื่อได้',
    lockAtt: 'ให้เฉพาะแอดมินเช็คชื่อ', clearAll: 'ลบประวัติการเช็คชื่อทั้งหมด',
    clearAllQ: 'ประวัติการเช็คชื่อทุกวันจะหายไป ยืนยัน?', note: 'หมายเหตุ',
    notePh: 'เช่น ป่วย, ไปหาหมอ...', month: 'สรุปเดือนนี้', status: 'สถานะ',
    nothing: 'ไม่มีคนที่ต้องเช็คแล้ว', reportBy: 'แอปรายชื่อพนักงาน',
    st: { present: 'มาทำงาน', absent: 'ขาดงาน', leave: 'ลา', off: 'หยุด', late: 'มาสาย', none: 'ยังไม่เช็ค' },
    sec: { present: 'มาทำงาน', absent: 'ขาดงาน', leave: 'ลางาน', off: 'วันหยุด', late: 'มาสาย', none: 'ยังไม่เช็คชื่อ' },
    short: { present: 'มา', absent: 'ขาด', leave: 'ลา', off: 'หยุด', late: 'สาย' },
    wd: ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'],
    wdS: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
    report: 'รายงานประจำเดือน', busList: 'รายชื่อตามสายรถ', riders: 'คนขึ้นรถ', noRiders: 'ไม่มีคนขึ้นรถ',
    backup: 'สำรองข้อมูล', restore: 'กู้คืนข้อมูล', paste: 'นำเข้าด้วยการวางข้อความ',
    importFile: 'นำเข้าจากไฟล์', welcome: 'ยังไม่มีรายชื่อพนักงาน',
    welcomeSub: 'นำเข้าไฟล์รายชื่อ (.json) หรือเข้าแอดมินเพื่อเพิ่มเอง',
    importQ: 'มีพนักงาน {w} คน ประวัติ {d} วัน แทนที่ข้อมูลปัจจุบัน?',
    badFile: 'ไฟล์ไม่ถูกต้อง (ไม่ใช่ไฟล์สำรองของแอปนี้)', imported: 'นำเข้าแล้ว',
    lastBackup: 'สำรองล่าสุด', never: 'ยังไม่เคย', daysAgo: 'วันที่แล้ว',
    backupRemind: 'ไม่ได้สำรองข้อมูลนานแล้ว — แตะเพื่อสำรองตอนนี้', backupHint: 'เก็บไฟล์สำรองไว้ใน LINE Keep / Google Drive',
    leaveType: 'ประเภทการลา',
    lt: { sick: 'ลาป่วย', personal: 'ลากิจ', annual: 'ลาพักร้อน', maternity: 'ลาคลอด', other: 'อื่นๆ' },
    yearUse: 'การลาปีนี้', remain: 'เหลือ', quota: 'วันลาต่อปี (วัน)',
    arrival: 'เวลามาถึง', lateBy: 'สาย', min: 'นาที', hrs: 'ชม.',
    ot: 'OT', otIn: 'OT เข้า', otOut: 'OT ออก', otTotal: 'รวม OT', clearOt: 'ลบ OT',
    saveRec: 'บันทึก', badTime: 'รูปแบบเวลาไม่ถูกต้อง (เช่น 06:30)',
    warn: 'เตือน', warnTx: 'เดือนนี้ขาด {n} วัน', warnLbl: 'จำนวนวันขาดที่ต้องเตือน (ต่อเดือน)',
    calendar: 'ปฏิทินเดือนนี้', exportCsv: 'ส่งออก Excel (CSV)', shareTxt: 'ส่งข้อความ',
    workDays: 'วันทำงาน', otHours: 'ชม. OT', lateTotal: 'นาทีที่สาย', shiftAll: 'ทุกกะ',
    noData: 'ยังไม่มีข้อมูลเดือนนี้', pastePh: 'วางข้อความสำรองข้อมูลที่นี่', importBtn: 'นำเข้า',
    emptyAdmin: 'เข้าแอดมินเพื่อเพิ่มเอง', dataSec: 'ข้อมูลและการสำรอง', leaveSec: 'การลาและการเตือน',
    contactSec: 'ติดต่อและข้อปฏิบัติ', secSec: 'ความปลอดภัย', otQuick: 'เพิ่ม OT ด่วน',
    cloud: 'Cloud Sync (ใช้ร่วมหลายเครื่อง)', projectId: 'Supabase Project ID', apiKey: 'Publishable key',
    teamCode: 'รหัสทีม (อย่างน้อย 8 ตัว)', connStr: 'วางข้อความเชื่อมต่อ (WNL1|...)', connect: 'เชื่อมต่อ',
    disconnect: 'ยกเลิกการเชื่อมต่อ', shareConn: 'ส่งข้อความเชื่อมต่อให้เครื่องอื่น', syncNow: 'ซิงค์ตอนนี้',
    syncOk: 'ซิงค์แล้ว', syncBusy: 'กำลังซิงค์...', syncErr: 'ซิงค์ไม่สำเร็จ', syncOff: 'ยังไม่เชื่อมต่อ Cloud',
    lastSync: 'ซิงค์ล่าสุด', pending: 'รายการที่ยังไม่ได้ส่ง', codeShort: 'รหัสทีมต้องมีอย่างน้อย 8 ตัว',
    needAll: 'กรอก Project ID, key และรหัสทีมให้ครบ', connFail: 'เชื่อมต่อ Cloud ไม่ได้',
    connFailHint: 'ตรวจสอบอินเทอร์เน็ต, key และรัน SQL ใน Supabase แล้วหรือยัง',
    chooseQ: 'มีข้อมูลของทีมนี้ใน Cloud แล้ว จะใช้ข้อมูลไหน?', useCloud: 'ใช้ข้อมูล Cloud',
    useLocal: 'อัปโหลดข้อมูลเครื่องนี้', created: 'สร้างทีมใน Cloud และอัปโหลดแล้ว', connected: 'เชื่อมต่อแล้ว',
    shareWarn: 'ข้อความนี้มีรหัสทีม ส่งให้เฉพาะคนในทีม', cloudHint: 'ใส่รหัสทีมเดียวกันทุกเครื่องเพื่อใช้รายชื่อและการเช็คชื่อร่วมกัน',
    connectedTo: 'เชื่อมต่ออยู่', clearCloudQ: 'จะลบใน Cloud ด้วย และหายจากทุกเครื่อง',
  },
  en: {
    title: 'Worker List', sub: 'Betagro • Nakhon Pathom Swine Slaughterhouse', s1: 'Shift 1', s2: 'Shift 2',
    day: 'Morning shift', night: 'Evening/Night shift', search: 'Search name or ID...', all: 'All',
    busR: 'Rubber Factory Bus', busP: 'Fish Pier Bus', moved: 'Moved', preg: 'Pregnant', lead: 'Supervisor',
    total: 'Total', ppl: 'people', job: 'Job', time: 'Work hours', id: 'Employee ID', bus: 'Bus route',
    noBus: 'Own transport', new: 'New', leaveM: 'Maternity leave', from1: 'Moved from Shift 1', from2: 'Moved from Shift 2',
    notice: 'Rules & Contacts', callShift: 'Shift Supervisor', callLine: 'Line Supervisor',
    vStatus: 'By status', vJob: 'By job', vList: 'Sheet order',
    pinTitle: 'Enter Admin PIN', pinWrong: 'Wrong PIN',
    enter: 'Login', cancel: 'Cancel', save: 'Save', edit: 'Edit', del: 'Delete',
    delQ: 'Delete this worker?', move: 'Move shift', add: 'Add worker',
    nameTh: 'Name (Thai)', nameMm: 'Name (Myanmar)', nameEn: 'Name (English)', shiftLbl: 'Shift',
    noteLbl: 'Status', none: 'None', settings: 'Admin Settings', newPin: 'New PIN (only to change)',
    shiftSup: 'Shift supervisor phone', lineSup: 'Line supervisor phone', empty: 'Nothing found',
    required: 'ID and at least one name are required', yes: 'Yes', idExists: 'This ID already exists',
    names: 'Name in 3 languages', rulesLbl: 'Rules', logout: 'Exit Admin', saved: 'Saved',
    adminMode: 'ADMIN MODE', jobAll: 'Job in 3 languages', tapHint: 'Tap buttons to mark • tap a name for OT/details',
    today: 'Today', attTitle: 'Attendance', marked: 'marked', allPresent: 'Rest all present',
    allPresentQ: 'Mark everyone not yet marked as "Present"?', share: 'Send report', clearDay: 'Clear',
    clearDayQ: 'Remove all marks for this shift on this day?', locked: 'Only admin can mark attendance',
    lockAtt: 'Only admin can mark attendance', clearAll: 'Delete all attendance history',
    clearAllQ: 'Attendance history for every day will be lost. Continue?', note: 'Note',
    notePh: 'e.g. sick, hospital visit...', month: 'This month', status: 'Status',
    nothing: 'Nobody left to mark', reportBy: 'Worker List App',
    st: { present: 'Present', absent: 'Absent', leave: 'Leave', off: 'Day off', late: 'Late', none: 'Not marked' },
    sec: { present: 'Present', absent: 'Absent', leave: 'On leave', off: 'Day off', late: 'Late', none: 'Not marked yet' },
    short: { present: 'In', absent: 'Absent', leave: 'Leave', off: 'Off', late: 'Late' },
    wd: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    wdS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    report: 'Monthly Report', busList: 'Bus Route List', riders: 'Riders', noRiders: 'No riders',
    backup: 'Create backup', restore: 'Restore backup', paste: 'Import by pasting text',
    importFile: 'Import from file', welcome: 'No workers yet',
    welcomeSub: 'Import the roster file (.json), or log in as admin to add workers',
    importQ: '{w} workers and {d} days of records. Replace current data?',
    badFile: 'Invalid file (not a backup from this app)', imported: 'Imported',
    lastBackup: 'Last backup', never: 'Never', daysAgo: 'days ago',
    backupRemind: 'No backup for a while — tap to back up now', backupHint: 'Keep the backup file in LINE Keep / Google Drive',
    leaveType: 'Leave type',
    lt: { sick: 'Sick', personal: 'Personal', annual: 'Annual', maternity: 'Maternity', other: 'Other' },
    yearUse: 'Leave used this year', remain: 'left', quota: 'Leave days per year',
    arrival: 'Arrival time', lateBy: 'Late', min: 'min', hrs: 'h',
    ot: 'OT', otIn: 'OT start', otOut: 'OT end', otTotal: 'OT total', clearOt: 'Clear OT',
    saveRec: 'Save record', badTime: 'Wrong time format (e.g. 06:30)',
    warn: 'Warning', warnTx: '{n} absences this month', warnLbl: 'Warn at absences per month',
    calendar: 'This month', exportCsv: 'Export Excel (CSV)', shareTxt: 'Send text',
    workDays: 'Work days', otHours: 'OT hours', lateTotal: 'Late minutes', shiftAll: 'All shifts',
    noData: 'No records this month yet', pastePh: 'Paste the backup text here', importBtn: 'Import',
    emptyAdmin: 'Log in as admin to add', dataSec: 'Data & Backup', leaveSec: 'Leave & Warnings',
    contactSec: 'Contacts & Rules', secSec: 'Security', otQuick: 'Quick OT',
    cloud: 'Cloud Sync (share across phones)', projectId: 'Supabase Project ID', apiKey: 'Publishable key',
    teamCode: 'Team code (at least 8 characters)', connStr: 'Paste connection text (WNL1|...)', connect: 'Connect',
    disconnect: 'Disconnect', shareConn: 'Send connection text to another phone', syncNow: 'Sync now',
    syncOk: 'Synced', syncBusy: 'Syncing...', syncErr: 'Sync failed', syncOff: 'Cloud not connected',
    lastSync: 'Last sync', pending: 'Changes not sent yet', codeShort: 'Team code must be at least 8 characters',
    needAll: 'Fill in Project ID, key and team code', connFail: 'Could not connect to Cloud',
    connFailHint: 'Check internet, the key, and that the SQL was run in Supabase',
    chooseQ: 'This team already has data in the Cloud. Which data should be used?', useCloud: 'Use Cloud data',
    useLocal: 'Upload this phone', created: 'Cloud team created and data uploaded', connected: 'Connected',
    shareWarn: 'This text contains the team code — send it only to your team', cloudHint: 'Use the same team code on every phone to share the list and attendance',
    connectedTo: 'Connected', clearCloudQ: 'This also deletes it in the Cloud, on every phone.',
  },
};

/* ===================== JOBS (TH / MM / EN) ===================== */
const JOBS = {
  lead: ['หัวหน้า', 'ခေါင်းဆောင်', 'Supervisor'],
  recv: ['รับหมู', 'ဝက်လက်ခံ', 'Pig Receiving'],
  hangPierce: ['แขวนขา เจาะเอ็น', 'ခြေချိတ် / အရွတ်ဖောက်', 'Leg Hanging & Tendon Piercing'],
  hang: ['แขวนขา', 'ခြေချိတ်', 'Leg Hanging'],
  pierce: ['เจาะเอ็น', 'အရွတ်ဖောက်', 'Tendon Piercing'],
  stick: ['แทงคอ', 'လည်ပင်းထိုး', 'Neck Sticking'],
  drive: ['ไล่หมู', 'ဝက်မောင်း', 'Pig Driving'],
  open: ['ผ่าห้อง', 'ဝမ်းခွဲ', 'Belly Opening'],
  openWhite: ['ผ่าห้องขาว', 'ဝမ်းခွဲ (အဖြူခန်း)', 'Belly Opening (White Room)'],
  openRed: ['ผ่าห้องแดง', 'ဝမ်းခွဲ (အနီခန်း)', 'Belly Opening (Red Room)'],
  split: ['ผ่าซาก', 'ကောင်ခွဲ', 'Carcass Splitting'],
  weight: ['Weight', 'အလေးချိန်', 'Weighing'],
  scrape: ['ขูดขน', 'အမွေးခြစ်', 'Hair Scraping'],
  scrapeBody: ['ขูดขนตัว', 'ကိုယ်အမွေးခြစ်', 'Body Hair Scraping'],
  scrapeHead: ['ขูดขนหัว', 'ခေါင်းအမွေးခြစ်', 'Head Hair Scraping'],
  scrapeNeck: ['ขูดขนคอ', 'လည်ပင်းအမွေးခြစ်', 'Neck Hair Scraping'],
  scrapeHeadNeck: ['ขูดขนหัว คอ', 'ခေါင်း/လည်ပင်း အမွေးခြစ်', 'Head & Neck Hair Scraping'],
  scrapeLegNeck: ['ขูดขนขา คอ', 'ခြေ/လည်ပင်း အမွေးခြစ်', 'Leg & Neck Hair Scraping'],
  spine: ['ขูดไขสันหลัง', 'ကျောရိုးချဉ်ခြစ်', 'Spinal Cord Scraping'],
  boilBlood: ['ต้มเลือด', 'သွေးပြုတ်', 'Blood Boiling'],
  scoop: ['ตักเลือด', 'သွေးခပ်', 'Blood Scooping'],
  scoopBoiled: ['ตักเลือดต้ม', 'သွေးပြုတ်ခပ်', 'Boiled Blood Scooping'],
  sepInt: ['แยกไส้', 'အူခွဲ', 'Intestine Separating'],
  sepRed: ['แยกเครื่องในแดง', 'ကလီစာနီခွဲ', 'Red Offal Separating'],
  sepSmall: ['แยกไส้อ่อน/ขม', 'အူသိမ် / သည်းခြေ ခွဲ', 'Small Intestine / Bile Separating'],
  washLarge: ['ล้างไส้ใหญ่', 'အူမကြီးဆေး', 'Large Intestine Washing'],
  washStomach: ['ล้างกระเพาะ', 'အစာအိမ်ဆေး', 'Stomach Washing'],
  tearLarge: ['ฉีกไส้ใหญ่', 'အူမကြီးဖြဲ', 'Large Intestine Tearing'],
  turn: ['กลับไส้', 'အူလှန်', 'Intestine Turning'],
  strip: ['รีดไส้', 'အူညှစ်', 'Intestine Stripping'],
  scald: ['ลวกไส้', 'အူရေနွေးဆွတ်', 'Intestine Scalding'],
  boilInt: ['ต้มไส้', 'အူပြုတ်', 'Intestine Boiling'],
  cutHead: ['ตัดหัว', 'ခေါင်းဖြတ်', 'Head Cutting'],
  putHead: ['ใส่หัว', 'ခေါင်းတင်', 'Head Loading'],
  headCollect: ['เก็บหัวหมู', 'ဝက်ခေါင်းသိမ်း', 'Pig Head Collecting'],
  pullFat: ['ดึงมันเปลว', 'အဆီဆွဲ', 'Leaf Fat Pulling'],
  weighFat: ['ชั่งมันเปลว', 'အဆီချိန်', 'Leaf Fat Weighing'],
  gall: ['ดึงถุงน้ำดี', 'သည်းခြေအိတ်ဆွဲ', 'Gallbladder Removal'],
  seal: ['ซีล', 'ဆီးလ်ပိတ်', 'Sealing'],
  offalSet: ['เครื่องในชุด', 'ကလီစာအစုံ', 'Offal Set'],
  liftRed: ['ยกเครื่องในแดง', 'ကလီစာနီ မ', 'Red Offal Lifting'],
  packRed: ['บรรจุเครื่องในแดง', 'ကလီစာနီ ထုပ်ပိုး', 'Red Offal Packing'],
  weighWhite: ['ชั่งของห้องขาว', 'အဖြူခန်း ပစ္စည်းချိန်', 'White Room Weighing'],
  weighWhiteSeal: ['ชั่งของห้องขาว/ซีล', 'အဖြူခန်းချိန် / ဆီးလ်', 'White Room Weighing / Sealing'],
  weighRed: ['ชั่งของฝั่งแดง', 'အနီဘက် ပစ္စည်းချိန်', 'Red Side Weighing'],
  preg: ['ตั้งครรภ์', 'ကိုယ်ဝန်ဆောင် (အလုပ်ပေါ့)', 'Pregnant (Light Duty)'],
};
const LI = { th: 0, mm: 1, en: 2 };
const jobName = (k, l) => (JOBS[k] ? JOBS[k][LI[l]] : k);

const RULES = {
  mm: 'ကိစ္စခွင့် – ၃ ရက်ကြို၍ အကြောင်းကြားရမည်\nခွင့်စာရေးရာတွင် ခေါင်းဆောင်၏ ခွင့်ပြုချက် ရယူရမည်\nအလုပ်ချိန်ကို ကိုယ်တိုင်ပြောင်းလဲခြင်း ခွင့်မပြုပါ',
  th: 'ลากิจ แจ้งล่วงหน้า 3 วัน\nการเขียนใบลา ต้องได้รับอนุญาตจากหัวหน้า\nเปลี่ยนเวลาทำงานเอง ไม่อนุมัติให้',
  en: 'Personal leave: notify 3 days in advance\nLeave forms must be approved by your supervisor\nChanging your own work hours is not allowed',
};

/* Worker names are NOT kept in the code (the repo is public).
   They are imported once from the roster/backup .json file inside the app. */
const initialData = () => ({
  workers: [],
  shiftPhone: '',
  linePhone: '',
  rules: { ...RULES },
  pin: '1234',
  att: {},          // { 'YYYY-MM-DD': { [id]: { s, n, lt, arr, oi, oo } } }
  lockAtt: false,
  quota: { sick: 30, personal: 3, annual: 6 },
  warnAbsent: 3,
  lastBackup: '',
  sync: { project: '', key: '', code: '', on: false, lastPull: '', rosterAt: '', lastOk: '' },
  syncQ: {},          // pending attendance changes: { 'date|id': rec | null }
  rosterDirty: false, // roster changed locally, not yet uploaded
});

/* ===================== CLOUD SYNC (Supabase RPC) ===================== */
const rpc = async (cfg, fn, body) => {
  const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = ctl ? setTimeout(() => ctl.abort(), 20000) : null;
  try {
    const res = await fetch(`https://${cfg.project.trim()}.supabase.co/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: cfg.key.trim(), Authorization: `Bearer ${cfg.key.trim()}` },
      body: JSON.stringify(body),
      signal: ctl ? ctl.signal : undefined,
    });
    const txt = await res.text();
    if (!res.ok) {
      let msg = txt;
      try { const j = JSON.parse(txt); msg = j.message || j.msg || j.error || txt; } catch (e) {}
      throw new Error(`${res.status} ${msg}`.slice(0, 300));
    }
    return txt ? JSON.parse(txt) : null;
  } finally { if (timer) clearTimeout(timer); }
};
const ROSTER_KEYS = ['workers', 'shiftPhone', 'linePhone', 'rules', 'quota', 'warnAbsent', 'lockAtt'];
const rosterOf = (d) => { const r = {}; ROSTER_KEYS.forEach((k) => { r[k] = d[k]; }); return r; };
const applyRoster = (d, r) => {
  if (!r || !Array.isArray(r.workers)) return d;
  const nd = { ...d };
  ROSTER_KEYS.forEach((k) => { if (r[k] !== undefined && r[k] !== null) nd[k] = r[k]; });
  return nd;
};
const allAttQ = (att) => {
  const q = {};
  Object.keys(att || {}).forEach((d) => Object.keys(att[d] || {}).forEach((id) => { q[d + '|' + id] = att[d][id]; }));
  return q;
};
const splitKey = (k) => { const i = k.indexOf('|'); return [k.slice(0, i), k.slice(i + 1)]; };
const parseConn = (txt) => {
  const m = (txt || '').trim().split('|').map((x) => x.trim());
  if (m[0] !== 'WNL1' || m.length < 3) return null;
  return { project: m[1] || '', key: m[2] || '', code: m[3] || '' };
};

/* ===================== HELPERS ===================== */
const MMD = '၀၁၂၃၄၅၆၇၈၉';
const MON = {
  mm: ['ဇန်နဝါရီ', 'ဖေဖော်ဝါရီ', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်', 'ဇူလိုင်', 'ဩဂုတ်', 'စက်တင်ဘာ', 'အောက်တိုဘာ', 'နိုဝင်ဘာ', 'ဒီဇင်ဘာ'],
  th: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};
const toMM = (s) => String(s).replace(/\d/g, (d) => MMD[d]);
const pad = (n) => (n < 10 ? '0' + n : '' + n);
const ymd = (dt) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
const parse = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (iso, n) => { const d = parse(iso); d.setDate(d.getDate() + n); return ymd(d); };
const addMonths = (ym, n) => { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };
const daysIn = (ym) => { const [y, m] = ym.split('-').map(Number); return new Date(y, m, 0).getDate(); };
const fmtDate = (iso, l) => {
  const d = parse(iso); const y = d.getFullYear(), m = d.getMonth(), dd = d.getDate();
  if (l === 'mm') return `${toMM(dd)} ${MON.mm[m]} ${toMM(y)}`;
  if (l === 'th') return `${dd} ${MON.th[m]} ${y + 543}`;
  return `${dd} ${MON.en[m]} ${y}`;
};
const fmtMonth = (ym, l) => {
  const [y, m] = ym.split('-').map(Number);
  if (l === 'mm') return `${MON.mm[m - 1]} ${toMM(y)}`;
  if (l === 'th') return `${MON.th[m - 1]} ${y + 543}`;
  return `${MON.en[m - 1]} ${y}`;
};
const fill = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] !== undefined ? o[k] : ''));
const toMin = (hm) => { const m = /^(\d{1,2}):(\d{2})$/.exec(hm || ''); return m ? +m[1] * 60 + +m[2] : null; };
const fromMin = (x) => { const v = ((x % 1440) + 1440) % 1440; return `${pad(Math.floor(v / 60))}:${pad(v % 60)}`; };
const normTime = (s) => {
  const v = (s || '').trim(); if (!v) return '';
  const m = /^(\d{1,2})[:.\s]?(\d{2})$/.exec(v); if (!m) return null;
  const h = +m[1], mi = +m[2]; if (h > 23 || mi > 59) return null;
  return `${pad(h)}:${pad(mi)}`;
};
const nowHM = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const shiftStart = (w) => (w.time || '').split('-')[0] || '';
const shiftEnd = (w) => (w.time || '').split('-')[1] || '';
const lateMins = (w, r) => {
  if (!r || r.s !== 'late') return 0;
  const a = toMin(r.arr), s = toMin(shiftStart(w));
  if (a === null || s === null) return 0;
  const d = (a - s + 1440) % 1440; return d > 720 ? 0 : d;
};
const otMins = (r) => {
  if (!r) return 0; const a = toMin(r.oi), b = toMin(r.oo);
  if (a === null || b === null) return 0; return (b - a + 1440) % 1440;
};
const hrs = (m) => { const h = Math.round((m / 60) * 10) / 10; return String(h); };
const nameOf = (w, l) => w[l] || w.en || w.th || w.mm || '-';
const subName = (w, l) => (l === 'th' ? w.en : w.th);
const noteColor = (n) => (n === 'new' ? C.green : n === 'leave' ? C.pink : C.cyan);
const anim = () => LayoutAnimation.configureNext(LayoutAnimation.create(220, 'easeInEaseOut', 'opacity'));
const csvCell = (v) => { const s = String(v === undefined || v === null ? '' : v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

const shareFile = async (name, content, mime) => {
  try {
    const uri = FileSystem.cacheDirectory + name;
    await FileSystem.writeAsStringAsync(uri, content, { encoding: 'utf8' });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: mime, dialogTitle: name });
      return true;
    }
  } catch (e) {}
  try { await Share.share({ message: content }); return true; } catch (e) { return false; }
};

/* ===================== SMALL COMPONENTS ===================== */
const Chip = ({ label, active, onPress, color = C.amber, icon }) => (
  <TouchableOpacity onPress={onPress} style={[st.chip, active && { backgroundColor: color, borderColor: color }]}>
    {icon ? <Ionicons name={icon} size={13} color={active ? '#0A0A12' : C.muted} style={{ marginRight: 4 }} /> : null}
    <Text style={[st.chipTx, active && { color: '#0A0A12', fontWeight: '800' }]}>{label}</Text>
  </TouchableOpacity>
);

const Tag = ({ text, color, icon }) => (
  <View style={[st.tag, { borderColor: color + '66', backgroundColor: color + '1F' }]}>
    {icon ? <Ionicons name={icon} size={10} color={color} style={{ marginRight: 3 }} /> : null}
    <Text style={[st.tagTx, { color }]}>{text}</Text>
  </View>
);

const Field = ({ label, ...p }) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={st.fLbl}>{label}</Text>
    <TextInput placeholderTextColor={C.muted} style={[st.input, p.multiline && { minHeight: 80, textAlignVertical: 'top' }]} {...p} />
  </View>
);

const SecTitle = ({ icon, text, color = C.amber }) => (
  <View style={st.secTitleRow}>
    <Ionicons name={icon} size={16} color={color} />
    <Text style={[st.secTitleTx, { color }]}>{text}</Text>
  </View>
);

/* ===================== APP ===================== */
export default function App() {
  const [lang, setLang] = useState('mm');
  const [data, setData] = useState(null);
  const [shift, setShift] = useState(1);
  const [attDate, setAttDate] = useState(ymd(new Date()));
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('status');
  const [detailId, setDetailId] = useState(null);
  const [dr, setDr] = useState({ n: '', arr: '', oi: '', oo: '' });
  const [flash, setFlash] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [pinIn, setPinIn] = useState('');
  const [form, setForm] = useState(null);
  const [setOpen, setSetOpen] = useState(false);
  const [sForm, setSForm] = useState(null);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [repOpen, setRepOpen] = useState(false);
  const [repYm, setRepYm] = useState(ymd(new Date()).slice(0, 7));
  const [repShift, setRepShift] = useState('all');
  const [busOpen, setBusOpen] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteTx, setPasteTx] = useState('');
  const [syncSt, setSyncSt] = useState('');
  const [syncErr, setSyncErr] = useState('');
  const [cForm, setCForm] = useState({ project: '', key: '', code: '', conn: '' });
  const dataRef = useRef(null);
  const syncRef = useRef(null);
  const langRef = useRef('mm');

  const t = T[lang];
  const accent = shift === 1 ? C.amber : C.violet;
  const num = (n) => (lang === 'mm' ? toMM(n) : String(n));
  const todayIso = ymd(new Date());

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        const l = await AsyncStorage.getItem(KEY + '_lang');
        if (l) setLang(l);
        if (raw) {
          const p = JSON.parse(raw);
          const base = initialData();
          const nd0 = { ...base, ...p, att: p.att || {}, lockAtt: !!p.lockAtt, quota: { ...base.quota, ...(p.quota || {}) }, workers: p.workers || [], sync: { ...base.sync, ...(p.sync || {}) }, syncQ: p.syncQ || {} };
          dataRef.current = nd0; setData(nd0);
        } else { dataRef.current = initialData(); setData(dataRef.current); }
      } catch (e) {
        dataRef.current = initialData(); setData(dataRef.current);
      }
    })();
  }, []);

  const save = (nd) => {
    dataRef.current = nd;
    setData(nd);
    AsyncStorage.setItem(KEY, JSON.stringify(nd)).catch(() => {});
  };

  /* ---------- cloud sync engine ---------- */
  const syncing = useRef(false);
  const pushTimer = useRef(null);
  const schedulePush = () => {
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => { syncRef.current && syncRef.current(); }, 1500);
  };
  const saveRoster = (nd) => {
    save({ ...nd, rosterDirty: !!(nd.sync && nd.sync.on) });
    if (nd.sync && nd.sync.on) schedulePush();
  };

  const syncNow = async (manual) => {
    const d0 = dataRef.current; const s = d0 && d0.sync;
    if (!s || !s.on || syncing.current) return;
    syncing.current = true; setSyncSt('busy');
    try {
      if (d0.rosterDirty) {
        const r = await rpc(s, 'wnl_push_roster', { p_code: s.code, p_roster: rosterOf(d0) });
        const c = dataRef.current;
        save({ ...c, rosterDirty: false, sync: { ...c.sync, rosterAt: (r && r.roster_at) || c.sync.rosterAt } });
      }
      const q = { ...(dataRef.current.syncQ || {}) }; const keys = Object.keys(q);
      for (let i = 0; i < keys.length; i += 400) {
        const chunk = keys.slice(i, i + 400);
        const rows = chunk.map((k) => { const [d, wid] = splitKey(k); return { d, wid, rec: q[k] || null }; });
        await rpc(s, 'wnl_push_att', { p_code: s.code, p_rows: rows });
        const c = dataRef.current; const nq = { ...(c.syncQ || {}) };
        chunk.forEach((k) => { if (JSON.stringify(nq[k]) === JSON.stringify(q[k])) delete nq[k]; });
        save({ ...c, syncQ: nq });
      }
      const since = s.lastPull || null; // server subtracts a 2-minute overlap
      const p = await rpc(s, 'wnl_pull', { p_code: s.code, p_since: since });
      const c = dataRef.current;
      if (!p || !p.exists) {
        // team vanished on the server: upload everything again on the next round
        save({ ...c, rosterDirty: true, syncQ: { ...allAttQ(c.att), ...(c.syncQ || {}) } });
        throw new Error('team not found – uploading again');
      }
      let nd = { ...c };
      const newer = p.roster_at && (!c.sync.rosterAt || p.roster_at > c.sync.rosterAt);
      if (newer && !c.rosterDirty) nd = applyRoster(nd, p.roster);
      const pending = nd.syncQ || {};
      const att = { ...nd.att }; const touched = {};
      (p.att || []).forEach((r) => {
        const k = r.d + '|' + r.wid; if (k in pending) return;
        if (!touched[r.d]) { att[r.d] = { ...(att[r.d] || {}) }; touched[r.d] = true; }
        if (r.rec) att[r.d][r.wid] = r.rec; else delete att[r.d][r.wid];
      });
      nd.att = att;
      nd.sync = { ...nd.sync, lastPull: p.now, rosterAt: newer ? p.roster_at : nd.sync.rosterAt, lastOk: new Date().toISOString() };
      if ((p.att || []).length || newer) anim();
      save(nd);
      setSyncSt('ok'); setSyncErr('');
    } catch (e) {
      setSyncSt('err'); setSyncErr(String((e && e.message) || e));
      if (manual) Alert.alert(T[langRef.current].syncErr, String((e && e.message) || e));
    } finally {
      syncing.current = false;
    }
  };
  syncRef.current = syncNow;
  const changeLang = (l) => { setLang(l); AsyncStorage.setItem(KEY + '_lang', l).catch(() => {}); };
  langRef.current = lang;

  // auto-sync: on start, every 45 s, and when the app comes back to the screen
  const loaded = !!data;
  useEffect(() => {
    if (!loaded) return undefined;
    syncRef.current && syncRef.current();
    const iv = setInterval(() => { syncRef.current && syncRef.current(); }, 45000);
    const sub = AppState.addEventListener ? AppState.addEventListener('change', (st2) => { if (st2 === 'active' && syncRef.current) syncRef.current(); }) : null;
    return () => { clearInterval(iv); if (sub && sub.remove) sub.remove(); };
  }, [loaded]);

  const day = (data && data.att[attDate]) || {};
  const stOf = (id) => (day[id] ? day[id].s : 'none');

  const shiftWorkers = useMemo(() => (data ? data.workers.filter((w) => w.shift === shift) : []), [data, shift]);

  const counts = useMemo(() => {
    const c = { present: 0, absent: 0, leave: 0, off: 0, late: 0, none: 0 };
    shiftWorkers.forEach((w) => { const s = day[w.id] ? day[w.id].s : 'none'; c[s] = (c[s] || 0) + 1; });
    return c;
  }, [shiftWorkers, day]);

  /* absences this month (for warnings) */
  const absMonth = useMemo(() => {
    const m = {}; if (!data) return m;
    const pre = attDate.slice(0, 7);
    Object.keys(data.att).forEach((d) => {
      if (!d.startsWith(pre)) return;
      const dd = data.att[d];
      Object.keys(dd).forEach((id) => { if (dd[id].s === 'absent') m[id] = (m[id] || 0) + 1; });
    });
    return m;
  }, [data, attDate]);
  const isWarn = (id) => data && data.warnAbsent > 0 && (absMonth[id] || 0) >= data.warnAbsent;
  const warnCount = shiftWorkers.filter((w) => isWarn(w.id)).length;

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return shiftWorkers
      .filter((w) => {
        if (filter.startsWith('st_')) return (day[w.id] ? day[w.id].s : 'none') === filter.slice(3);
        if (filter === 'R') return w.bus === 'R';
        if (filter === 'P') return w.bus === 'P';
        if (filter === 'moved') return w.note === 'from1' || w.note === 'from2';
        if (filter === 'preg') return w.job === 'preg';
        if (filter === 'lead') return w.job === 'lead';
        if (filter === 'warn') return isWarn(w.id);
        return true;
      })
      .filter((w) => !s || [w.id, w.th, w.mm, w.en].some((x) => (x || '').toLowerCase().includes(s)));
  }, [shiftWorkers, q, filter, day, absMonth]);

  const sections = useMemo(() => {
    if (view === 'list') return [{ key: 'all', title: null, data: list }];
    if (view === 'job') {
      const map = {}; const order = [];
      list.forEach((w) => { if (!map[w.job]) { map[w.job] = []; order.push(w.job); } map[w.job].push(w); });
      return order.map((k) => ({ key: k, title: jobName(k, lang), data: map[k] }));
    }
    const map = {}; ORDER.forEach((s) => { map[s] = []; });
    list.forEach((w) => { const s = day[w.id] ? day[w.id].s : 'none'; (map[s] || map.none).push(w); });
    return ORDER.filter((s) => map[s].length).map((s) => ({ key: s, status: s, title: t.sec[s], data: map[s] }));
  }, [list, view, lang, day, t]);

  /* monthly aggregate for report */
  const monthAgg = (ym) => {
    const agg = {};
    data.workers.forEach((w) => { agg[w.id] = { present: 0, late: 0, absent: 0, leave: 0, off: 0, lateMin: 0, otMin: 0, lt: {}, days: {} }; });
    Object.keys(data.att).forEach((d) => {
      if (!d.startsWith(ym)) return;
      const dd = data.att[d]; const dn = +d.slice(8, 10);
      Object.keys(dd).forEach((id) => {
        const a = agg[id]; if (!a) return; const r = dd[id]; const w = data.workers.find((x) => x.id === id);
        if (a[r.s] !== undefined) a[r.s]++;
        a.days[dn] = r.s;
        if (r.s === 'late') a.lateMin += lateMins(w, r);
        a.otMin += otMins(r);
        if (r.s === 'leave') { const k = r.lt || 'other'; a.lt[k] = (a.lt[k] || 0) + 1; }
      });
    });
    return agg;
  };

  /* ---------- attendance actions ---------- */
  const canMark = () => {
    if (data.lockAtt && !admin) { Alert.alert('🔒', t.locked); return false; }
    return true;
  };
  const writeDay = (date, nd) => {
    const cur = dataRef.current || data;
    const old = cur.att[date] || {};
    const q = { ...(cur.syncQ || {}) };
    const on = cur.sync && cur.sync.on;
    if (on) {
      const ids = {}; Object.keys(old).forEach((id) => { ids[id] = 1; }); Object.keys(nd).forEach((id) => { ids[id] = 1; });
      Object.keys(ids).forEach((id) => { if (JSON.stringify(old[id] || null) !== JSON.stringify(nd[id] || null)) q[date + '|' + id] = nd[id] || null; });
    }
    save({ ...cur, att: { ...cur.att, [date]: nd }, syncQ: q });
    if (on) schedulePush();
  };

  const mark = (w, s) => {
    if (!canMark()) return;
    anim();
    const nd = { ...day };
    const cur = nd[w.id];
    if (cur && cur.s === s) delete nd[w.id];
    else {
      const r = { ...(cur || {}), s };
      if (s === 'leave' && !r.lt) r.lt = w.note === 'leave' ? 'maternity' : 'personal';
      if (s === 'late' && !r.arr && attDate === todayIso) r.arr = nowHM();
      nd[w.id] = r;
    }
    writeDay(attDate, nd);
  };

  const patchRec = (w, patch) => {
    if (!canMark()) return;
    const nd = { ...day };
    nd[w.id] = { ...(nd[w.id] || { s: 'present' }), ...patch };
    writeDay(attDate, nd);
  };

  const loadDr = (id, date) => {
    const r = (data.att[date] && data.att[date][id]) || {};
    setDr({ n: r.n || '', arr: r.arr || '', oi: r.oi || '', oo: r.oo || '' });
  };

  const flashSaved = () => { setFlash(true); setTimeout(() => setFlash(false), 1400); };

  const saveDr = (w) => {
    const arr = normTime(dr.arr), oi = normTime(dr.oi), oo = normTime(dr.oo);
    if (arr === null || oi === null || oo === null) return Alert.alert(t.badTime);
    const has = day[w.id];
    if (!has && !dr.n.trim() && !oi && !oo) return;
    patchRec(w, { n: dr.n.trim(), arr: arr || '', oi: oi || '', oo: oo || '' });
    setDr({ n: dr.n.trim(), arr: arr || '', oi: oi || '', oo: oo || '' });
    flashSaved();
  };

  const quickOt = (w, h) => {
    const start = normTime(dr.oi) || shiftEnd(w) || '17:00';
    const oi = start, oo = fromMin(toMin(start) + h * 60);
    setDr({ ...dr, oi, oo });
    patchRec(w, { oi, oo });
    flashSaved();
  };
  const clearOt = (w) => { setDr({ ...dr, oi: '', oo: '' }); if (day[w.id]) patchRec(w, { oi: '', oo: '' }); };

  const markAllPresent = () => {
    if (!canMark()) return;
    const rest = shiftWorkers.filter((w) => !day[w.id]);
    if (!rest.length) return Alert.alert(t.nothing);
    Alert.alert(t.allPresent, `${t.allPresentQ}\n(${num(rest.length)} ${t.ppl})`, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.yes, onPress: () => {
          anim();
          const nd = { ...day };
          rest.forEach((w) => { nd[w.id] = w.note === 'leave' ? { s: 'leave', lt: 'maternity' } : { s: 'present' }; });
          writeDay(attDate, nd);
        },
      },
    ]);
  };

  const clearDay = () => {
    if (!canMark()) return;
    Alert.alert(t.clearDay, t.clearDayQ, [
      { text: t.cancel, style: 'cancel' },
      { text: t.yes, style: 'destructive', onPress: () => { anim(); const nd = { ...day }; shiftWorkers.forEach((w) => { delete nd[w.id]; }); writeDay(attDate, nd); } },
    ]);
  };

  const EMO = { present: '✅', absent: '❌', leave: '📝', off: '🛌', late: '⏰', none: '⚪' };

  const shareReport = () => {
    const sName = shift === 1 ? t.s1 : t.s2;
    let txt = `📋 ${t.title} – ${sName}\n📅 ${t.wd[parse(attDate).getDay()]}, ${fmtDate(attDate, lang)}\n\n`;
    txt += `👥 ${t.total}: ${num(shiftWorkers.length)} ${t.ppl}\n`;
    ORDER.forEach((s) => { if (counts[s]) txt += `${EMO[s]} ${t.st[s]}: ${num(counts[s])}\n`; });
    ['absent', 'leave', 'off', 'late', 'none'].forEach((s) => {
      const ws = shiftWorkers.filter((w) => stOf(w.id) === s);
      if (!ws.length) return;
      txt += `\n${EMO[s]} ${t.sec[s]} (${num(ws.length)})\n`;
      ws.forEach((w, i) => {
        const r = day[w.id] || {};
        let extra = '';
        if (s === 'leave' && r.lt) extra += ` [${t.lt[r.lt]}]`;
        if (s === 'late' && r.arr) extra += ` [${r.arr} +${num(lateMins(w, r))}${t.min}]`;
        if (r.n) extra += ` – ${r.n}`;
        txt += `${num(i + 1)}. ${nameOf(w, lang)} (${w.id})${extra}\n`;
      });
    });
    const otW = shiftWorkers.filter((w) => otMins(day[w.id]) > 0);
    if (otW.length) {
      txt += `\n⚡ ${t.ot} (${num(otW.length)})\n`;
      otW.forEach((w, i) => { const r = day[w.id]; txt += `${num(i + 1)}. ${nameOf(w, lang)} ${r.oi}-${r.oo} = ${num(hrs(otMins(r)))}${t.hrs}\n`; });
    }
    txt += `\n— ${t.reportBy}`;
    Share.share({ message: txt }).catch(() => {});
  };

  /* ---------- bus ---------- */
  const busRiders = (b) => shiftWorkers.filter((w) => w.bus === b && !['absent', 'leave', 'off'].includes(stOf(w.id)));
  const shareBus = () => {
    let txt = `🚌 ${t.busList} – ${shift === 1 ? t.s1 : t.s2}\n📅 ${fmtDate(attDate, lang)}\n`;
    ['R', 'P'].forEach((b) => {
      const ws = busRiders(b);
      txt += `\n${b === 'R' ? '🟢' : '🔵'} ${b === 'R' ? t.busR : t.busP} – ${num(ws.length)} ${t.ppl}\n`;
      ws.forEach((w, i) => { txt += `${num(i + 1)}. ${nameOf(w, lang)} (${w.id}) ${shiftStart(w)}\n`; });
    });
    Share.share({ message: txt }).catch(() => {});
  };

  /* ---------- report ---------- */
  const repWorkers = data ? data.workers.filter((w) => repShift === 'all' || w.shift === repShift) : [];
  const repAgg = useMemo(() => (data && repOpen ? monthAgg(repYm) : {}), [data, repOpen, repYm]);

  const exportCsv = async () => {
    const n = daysIn(repYm);
    const head = ['ID', 'Name (MM)', 'Name (TH)', 'Name (EN)', 'Shift', 'Job', 'Present', 'Late', 'Absent', 'Leave', 'Off',
      'Sick', 'Personal', 'Annual', 'Maternity', 'Other leave', 'Late minutes', 'OT hours'];
    for (let d = 1; d <= n; d++) head.push(String(d));
    const rows = [head];
    repWorkers.forEach((w) => {
      const a = repAgg[w.id]; if (!a) return;
      const r = [w.id, w.mm, w.th, w.en, w.shift, jobName(w.job, 'en'), a.present, a.late, a.absent, a.leave, a.off,
        a.lt.sick || 0, a.lt.personal || 0, a.lt.annual || 0, a.lt.maternity || 0, a.lt.other || 0, a.lateMin, hrs(a.otMin)];
      for (let d = 1; d <= n; d++) r.push(a.days[d] ? STATUS[a.days[d]].code : '');
      rows.push(r);
    });
    rows.push([]);
    rows.push(['P = Present', 'LT = Late', 'A = Absent', 'L = Leave', 'O = Day off']);
    const csv = '﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\n');
    await shareFile(`worker-report-${repYm}.csv`, csv, 'text/csv');
  };

  const shareMonthText = () => {
    let txt = `📊 ${t.report} – ${fmtMonth(repYm, lang)}\n${repShift === 'all' ? t.shiftAll : repShift === 1 ? t.s1 : t.s2} • ${num(repWorkers.length)} ${t.ppl}\n\n`;
    const sorted = [...repWorkers].sort((a, b) => (repAgg[b.id].absent - repAgg[a.id].absent) || (repAgg[b.id].leave - repAgg[a.id].leave));
    sorted.forEach((w, i) => {
      const a = repAgg[w.id];
      txt += `${num(i + 1)}. ${nameOf(w, lang)} (${w.id})\n   ✅${num(a.present + a.late)} ❌${num(a.absent)} 📝${num(a.leave)} 🛌${num(a.off)} ⏰${num(a.lateMin)}${t.min} ⚡${num(hrs(a.otMin))}${t.hrs}\n`;
    });
    txt += `\n— ${t.reportBy}`;
    Share.share({ message: txt }).catch(() => {});
  };

  /* ---------- backup / restore ---------- */
  const doBackup = async () => {
    const { pin, sync, syncQ, rosterDirty, ...rest } = data;
    const payload = { app: 'worker-name-list', v: 2, exportedAt: new Date().toISOString(), data: rest };
    const ok = await shareFile(`worker-backup-${todayIso}.json`, JSON.stringify(payload), 'application/json');
    if (ok) save({ ...data, lastBackup: todayIso });
  };

  const applyImport = (txt) => {
    let obj;
    try { obj = JSON.parse(txt); } catch (e) { return Alert.alert(t.badFile); }
    const d = obj && (obj.data || obj);
    if (!d || !Array.isArray(d.workers) || d.workers.some((w) => !w || !w.id)) return Alert.alert(t.badFile);
    const doIt = () => {
      const base = initialData();
      const nd = {
        ...base, ...data, ...d,
        pin: data.pin,
        att: d.att ? d.att : data.att,
        quota: { ...base.quota, ...(data.quota || {}), ...(d.quota || {}) },
        rules: d.rules || data.rules,
        workers: d.workers.map((w) => ({ id: String(w.id), th: w.th || '', mm: w.mm || '', en: w.en || '', job: w.job || 'drive', time: w.time || '', bus: w.bus || '', note: w.note || '', shift: w.shift === 2 ? 2 : 1 })),
        sync: data.sync, syncQ: data.sync.on ? { ...(data.syncQ || {}), ...allAttQ(d.att ? d.att : {}) } : {}, rosterDirty: false,
      };
      saveRoster(nd); setPasteOpen(false); setPasteTx(''); setSetOpen(false);
      Alert.alert('✅', `${t.imported} (${num(nd.workers.length)} ${t.ppl})`);
    };
    if (!data.workers.length) return doIt();
    Alert.alert(t.restore, fill(t.importQ, { w: num(d.workers.length), d: num(Object.keys(d.att || {}).length) }), [
      { text: t.cancel, style: 'cancel' }, { text: t.yes, style: 'destructive', onPress: doIt },
    ]);
  };

  const importFromFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true, multiple: false });
      if (!res || res.canceled || res.type === 'cancel') return;
      const uri = res.assets && res.assets[0] ? res.assets[0].uri : res.uri;
      if (!uri) return;
      const txt = await FileSystem.readAsStringAsync(uri, { encoding: 'utf8' });
      applyImport(txt);
    } catch (e) {
      Alert.alert(t.badFile, String(e && e.message ? e.message : e));
    }
  };

  /* ---------- admin actions ---------- */
  const tryLogin = () => {
    if (pinIn === data.pin) { setAdmin(true); setPinOpen(false); setPinIn(''); }
    else Alert.alert(t.pinWrong);
  };

  const openDetail = (w) => { loadDr(w.id, attDate); setDetailId(w.id); };

  const openEdit = (w) => {
    setDetailId(null);
    setForm(w ? { ...w, _orig: w.id } : {
      id: '', th: '', mm: '', en: '', job: 'drive',
      time: shift === 1 ? '06:00-15:00' : '16:00-01:00', bus: '', note: 'new', shift, _orig: null,
    });
  };

  const saveForm = () => {
    const f = form;
    if (!f.id.trim() || !(f.th.trim() || f.mm.trim() || f.en.trim())) return Alert.alert(t.required);
    if (data.workers.find((w) => w.id === f.id.trim() && w.id !== f._orig)) return Alert.alert(t.idExists);
    const clean = { id: f.id.trim(), th: f.th.trim(), mm: f.mm.trim(), en: f.en.trim(), job: f.job, time: f.time.trim(), bus: f.bus, note: f.note, shift: f.shift };
    const workers = f._orig ? data.workers.map((w) => (w.id === f._orig ? clean : w)) : [...data.workers, clean];
    saveRoster({ ...data, workers });
    setForm(null);
  };

  const delWorker = (w) => {
    Alert.alert(t.del, `${nameOf(w, lang)}\n${t.delQ}`, [
      { text: t.cancel, style: 'cancel' },
      { text: t.del, style: 'destructive', onPress: () => { setDetailId(null); saveRoster({ ...data, workers: data.workers.filter((x) => x.id !== w.id) }); } },
    ]);
  };

  const moveWorker = (w) => {
    const nw = { ...w, shift: w.shift === 1 ? 2 : 1, note: w.shift === 1 ? 'from1' : 'from2' };
    saveRoster({ ...data, workers: data.workers.map((x) => (x.id === w.id ? nw : x)) });
    setDetailId(null);
  };

  const openSettings = () => {
    setSForm({
      shiftPhone: data.shiftPhone, linePhone: data.linePhone, rules: { ...data.rules }, pin: '', lockAtt: data.lockAtt,
      qs: String(data.quota.sick), qp: String(data.quota.personal), qa: String(data.quota.annual), wa: String(data.warnAbsent),
    });
    setCForm({ project: data.sync.project || '', key: data.sync.key || '', code: '', conn: '' });
    setSetOpen(true);
  };
  const saveSettings = () => {
    const s = sForm;
    const n = (v, d) => { const x = parseInt(v, 10); return isNaN(x) || x < 0 ? d : x; };
    saveRoster({
      ...data, shiftPhone: s.shiftPhone.trim(), linePhone: s.linePhone.trim(), rules: s.rules, lockAtt: s.lockAtt,
      pin: s.pin.trim() ? s.pin.trim() : data.pin,
      quota: { sick: n(s.qs, 30), personal: n(s.qp, 3), annual: n(s.qa, 6) }, warnAbsent: n(s.wa, 3),
    });
    setSetOpen(false);
    Alert.alert(t.saved);
  };
  const clearAllAtt = () => {
    const on = data.sync.on;
    Alert.alert(t.clearAll, on ? `${t.clearAllQ}\n${t.clearCloudQ}` : t.clearAllQ, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.yes, style: 'destructive', onPress: async () => {
          if (on) {
            try { await rpc(data.sync, 'wnl_clear_att', { p_code: data.sync.code }); } catch (e) { return Alert.alert(t.connFail, String(e.message || e)); }
          }
          save({ ...dataRef.current, att: {}, syncQ: {} }); setSetOpen(false);
        },
      },
    ]);
  };

  /* ---------- cloud connect ---------- */
  const fillFromConn = (txt) => {
    const c = parseConn(txt);
    setCForm(c ? { ...cForm, ...c, code: c.code || cForm.code, conn: txt } : { ...cForm, conn: txt });
  };
  const connectCloud = async () => {
    const cfg0 = { project: cForm.project.trim(), key: cForm.key.trim(), code: cForm.code.trim() };
    if (!cfg0.project || !cfg0.key || !cfg0.code) return Alert.alert(t.needAll);
    if (cfg0.code.length < 8) return Alert.alert(t.codeShort);
    const cfg = { ...initialData().sync, ...cfg0, on: true };
    setSyncSt('busy');
    let p;
    try { p = await rpc(cfg, 'wnl_pull', { p_code: cfg.code, p_since: null }); }
    catch (e) { setSyncSt('err'); return Alert.alert(t.connFail, `${String(e.message || e)}\n\n${t.connFailHint}`); }
    setSyncSt('');
    const c = dataRef.current;
    const uploadAll = () => {
      save({ ...c, sync: cfg, syncQ: allAttQ(c.att), rosterDirty: true });
      syncNow(true); Alert.alert('☁️', p.exists ? t.connected : t.created);
    };
    const useCloud = () => {
      let nd = applyRoster({ ...c, sync: cfg, rosterDirty: false }, p.roster);
      const cloudAtt = {};
      (p.att || []).forEach((r) => { if (!r.rec) return; cloudAtt[r.d] = cloudAtt[r.d] || {}; cloudAtt[r.d][r.wid] = r.rec; });
      const q = {};
      const att = { ...cloudAtt };
      Object.keys(c.att).forEach((d) => Object.keys(c.att[d]).forEach((id) => {
        if (!cloudAtt[d] || !cloudAtt[d][id]) { att[d] = { ...(att[d] || {}), [id]: c.att[d][id] }; q[d + '|' + id] = c.att[d][id]; }
      }));
      nd = { ...nd, att, syncQ: q, sync: { ...cfg, lastPull: p.now, rosterAt: p.roster_at, lastOk: new Date().toISOString() } };
      anim(); save(nd); setSyncSt('ok');
      if (Object.keys(q).length) schedulePush();
      Alert.alert('☁️', `${t.connected} (${num(nd.workers.length)} ${t.ppl})`);
    };
    if (!p.exists) return uploadAll();
    if (!c.workers.length) return useCloud();
    Alert.alert('☁️', t.chooseQ, [
      { text: t.cancel, style: 'cancel' },
      { text: t.useCloud, onPress: useCloud },
      { text: t.useLocal, style: 'destructive', onPress: uploadAll },
    ]);
  };
  const disconnectCloud = () => {
    Alert.alert(t.disconnect, '', [
      { text: t.cancel, style: 'cancel' },
      { text: t.yes, style: 'destructive', onPress: () => { const c = dataRef.current; save({ ...c, sync: { ...c.sync, on: false, code: '' }, syncQ: {}, rosterDirty: false }); setSyncSt(''); } },
    ]);
  };
  const shareConn = () => {
    const s = data.sync;
    Share.share({ message: `${t.shareWarn}\n\nWNL1|${s.project}|${s.key}|${s.code}` }).catch(() => {});
  };

  const call = (p) => { if (p) Linking.openURL('tel:' + p.replace(/[^0-9+]/g, '')).catch(() => {}); };

  if (!data) {
    return (
      <View style={[st.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <Ionicons name="people" size={48} color={C.amber} />
      </View>
    );
  }

  const noteLabel = (n) => (n === 'leave' ? t.leaveM : t[n] || '');
  const busLabel = (b) => (b === 'R' ? t.busR : b === 'P' ? t.busP : t.noBus);
  const detail = detailId ? data.workers.find((w) => w.id === detailId) : null;
  const shiftMarked = shiftWorkers.length - counts.none;
  const pct = shiftWorkers.length ? shiftMarked / shiftWorkers.length : 0;
  const hasWorkers = data.workers.length > 0;
  const hasAtt = Object.keys(data.att).length > 0;
  const backupAge = data.lastBackup ? Math.round((parse(todayIso) - parse(data.lastBackup)) / 86400000) : null;
  const needBackup = hasWorkers && hasAtt && (backupAge === null || backupAge >= 7);
  const markedOf = (s) => data.workers.filter((w) => w.shift === s && day[w.id]).length;
  const c1 = data.workers.filter((w) => w.shift === 1).length;
  const c2 = data.workers.filter((w) => w.shift === 2).length;

  /* ---------- row ---------- */
  const renderItem = ({ item: w, index }) => {
    const s = stOf(w.id);
    const S = STATUS[s];
    const r = day[w.id];
    const barColor = s !== 'none' ? S.color : w.job === 'lead' ? C.pink : accent;
    const lm = lateMins(w, r);
    const om = otMins(r);
    const warn = isWarn(w.id);
    return (
      <View style={[st.row, s !== 'none' && { borderColor: S.color + '55', backgroundColor: S.color + '0D' }]}>
        <View style={[st.rowBar, { backgroundColor: barColor }]} />
        <TouchableOpacity activeOpacity={0.8} onPress={() => openDetail(w)} style={st.rowTop}>
          <View style={[st.avatar, { borderColor: barColor }]}>
            {s !== 'none'
              ? <Ionicons name={S.icon} size={20} color={S.color} />
              : <Text style={[st.avatarTx, { color: accent }]}>{num(index + 1)}</Text>}
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={st.name} numberOfLines={1}>{nameOf(w, lang)}</Text>
              {w.job === 'lead' && <Ionicons name="star" size={13} color={C.pink} style={{ marginLeft: 6 }} />}
              {warn && <Ionicons name="warning" size={14} color={C.yellow} style={{ marginLeft: 6 }} />}
            </View>
            <Text style={st.subName} numberOfLines={1}>{subName(w, lang)} • {w.id}</Text>
            <View style={st.rowTags}>
              <Tag text={jobName(w.job, lang)} color={accent} />
              {w.bus ? <Tag text={busLabel(w.bus)} color={w.bus === 'R' ? C.green : C.cyan} /> : null}
              {w.note ? <Tag text={noteLabel(w.note)} color={noteColor(w.note)} /> : null}
              {warn ? <Tag icon="warning" text={fill(t.warnTx, { n: num(absMonth[w.id]) })} color={C.yellow} /> : null}
            </View>
            {(r && (r.lt && s === 'leave' || lm > 0 || (s === 'late' && r.arr) || om > 0 || r.n)) ? (
              <View style={st.infoRow}>
                {s === 'leave' && r.lt ? <Tag icon={LT_ICON[r.lt]} text={t.lt[r.lt]} color={S.color} /> : null}
                {s === 'late' && r.arr ? <Tag icon="alarm" text={`${r.arr} • +${num(lm)} ${t.min}`} color={S.color} /> : null}
                {om > 0 ? <Tag icon="flash" text={`${t.ot} ${num(hrs(om))} ${t.hrs}`} color={C.yellow} /> : null}
                {r.n ? <Text style={[st.rowNote, { color: S.color }]} numberOfLines={1}>📝 {r.n}</Text> : null}
              </View>
            ) : null}
          </View>
          <View style={st.timeBox}>
            <Ionicons name="time-outline" size={13} color={C.muted} />
            <Text style={st.timeTx}>{shiftStart(w) || '—'}</Text>
            <Text style={st.timeTx2}>{shiftEnd(w)}</Text>
          </View>
        </TouchableOpacity>
        <View style={st.seg}>
          {SEG.map((k) => {
            const on = s === k; const K = STATUS[k];
            return (
              <TouchableOpacity key={k} activeOpacity={0.7} onPress={() => mark(w, k)}
                style={[st.segBtn, { borderColor: K.color + '44' }, on && { backgroundColor: K.color, borderColor: K.color }]}>
                <Ionicons name={K.icon} size={13} color={on ? '#0A0A12' : K.color} />
                <Text style={[st.segTx, { color: on ? '#0A0A12' : C.muted }, on && { fontWeight: '900' }]} numberOfLines={1}>{t.short[k]}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  /* ---------- header ---------- */
  const isToday = attDate === todayIso;
  const Header = (
    <View>
      <View style={st.top}>
        <View style={{ flex: 1 }}>
          <Text style={st.title}>{t.title}</Text>
          <Text style={st.sub} numberOfLines={1}>{t.sub}</Text>
        </View>
        {hasWorkers && (
          <TouchableOpacity onPress={() => { setRepYm(attDate.slice(0, 7)); setRepShift(shift); setRepOpen(true); }} style={[st.iconBtn, { marginRight: 8 }]}>
            <Ionicons name="bar-chart" size={19} color={C.cyan} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => (admin ? openSettings() : setPinOpen(true))} style={[st.iconBtn, admin && { borderColor: C.amber }]}>
          <Ionicons name={admin ? 'settings' : 'shield-checkmark-outline'} size={20} color={admin ? C.amber : C.text} />
        </TouchableOpacity>
      </View>

      <View style={st.langRow}>
        {[['mm', 'မြန်မာ'], ['th', 'ไทย'], ['en', 'EN']].map(([k, l]) => (
          <TouchableOpacity key={k} onPress={() => changeLang(k)} style={[st.langBtn, lang === k && st.langOn]}>
            <Text style={[st.langTx, lang === k && { color: '#0A0A12' }]}>{l}</Text>
          </TouchableOpacity>
        ))}
        <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center' }}>
          {data.lockAtt ? <Ionicons name="lock-closed" size={16} color={C.amber} style={{ marginRight: 10 }} /> : null}
          {data.sync.on ? (
            <TouchableOpacity onPress={() => syncNow(true)} style={[st.cloudPill, { borderColor: (syncSt === 'err' ? C.red : syncSt === 'busy' ? C.amber : C.green) + '88' }]}>
              <Ionicons name={syncSt === 'err' ? 'cloud-offline' : syncSt === 'busy' ? 'cloud-upload' : 'cloud-done'} size={16}
                color={syncSt === 'err' ? C.red : syncSt === 'busy' ? C.amber : C.green} />
              {Object.keys(data.syncQ || {}).length || data.rosterDirty ? (
                <Text style={[st.cloudN, { color: C.amber }]}>{num(Object.keys(data.syncQ || {}).length + (data.rosterDirty ? 1 : 0))}</Text>
              ) : null}
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {admin && (
        <View style={st.adminBar}>
          <Ionicons name="flash" size={14} color="#0A0A12" />
          <Text style={st.adminBarTx}>{t.adminMode}</Text>
        </View>
      )}

      {needBackup && (
        <TouchableOpacity onPress={doBackup} style={st.remind}>
          <Ionicons name="cloud-upload" size={18} color="#0A0A12" />
          <Text style={st.remindTx}>{t.backupRemind}</Text>
        </TouchableOpacity>
      )}

      {hasWorkers && (
        <View>
          <View style={st.dateBar}>
            <TouchableOpacity onPress={() => setAttDate(addDays(attDate, -1))} style={st.dateArrow}>
              <Ionicons name="chevron-back" size={22} color={C.text} />
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, alignItems: 'center' }} onPress={() => setAttDate(todayIso)}>
              <Text style={st.dateWd}>{t.wd[parse(attDate).getDay()]}{isToday ? ` • ${t.today}` : ''}</Text>
              <Text style={st.dateBig}>{fmtDate(attDate, lang)}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAttDate(addDays(attDate, 1))} style={st.dateArrow}>
              <Ionicons name="chevron-forward" size={22} color={C.text} />
            </TouchableOpacity>
          </View>
          {!isToday && (
            <TouchableOpacity onPress={() => setAttDate(todayIso)} style={st.todayBtn}>
              <Ionicons name="today" size={14} color="#0A0A12" />
              <Text style={st.todayTx}>{t.today}</Text>
            </TouchableOpacity>
          )}

          <View style={st.shiftRow}>
            {[1, 2].map((s) => {
              const on = shift === s; const col = s === 1 ? C.amber : C.violet;
              const tot = s === 1 ? c1 : c2; const mk2 = markedOf(s);
              return (
                <TouchableOpacity key={s} activeOpacity={0.85} onPress={() => { anim(); setShift(s); setFilter('all'); }}
                  style={[st.shiftCard, on && { backgroundColor: col, borderColor: col }]}>
                  <View style={st.shiftHead}>
                    <Ionicons name={s === 1 ? 'sunny' : 'moon'} size={22} color={on ? '#0A0A12' : col} />
                    <Text style={[st.shiftBig, { color: on ? '#0A0A12' : C.text }]}>{num(tot)}</Text>
                  </View>
                  <Text style={[st.shiftName, { color: on ? '#0A0A12' : C.text }]}>{s === 1 ? t.s1 : t.s2}</Text>
                  <Text style={[st.shiftSub, { color: on ? '#0A0A12AA' : C.muted }]}>{s === 1 ? t.day : t.night}</Text>
                  <View style={[st.miniTrack, { backgroundColor: on ? '#0A0A1233' : C.line }]}>
                    <View style={[st.miniFill, { width: `${tot ? (mk2 / tot) * 100 : 0}%`, backgroundColor: on ? '#0A0A12' : col }]} />
                  </View>
                  <Text style={[st.shiftSub, { color: on ? '#0A0A12AA' : C.muted }]}>{num(mk2)}/{num(tot)} {t.marked}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={st.attCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Ionicons name="pulse" size={18} color={accent} />
              <Text style={st.attTitle}>{t.attTitle}</Text>
              <Text style={[st.attPct, { color: accent }]}>{num(Math.round(pct * 100))}%</Text>
            </View>
            <View style={st.track}>
              {['present', 'late', 'leave', 'off', 'absent'].map((s) =>
                counts[s] ? <View key={s} style={{ flex: counts[s], backgroundColor: STATUS[s].color }} /> : null)}
              {counts.none ? <View style={{ flex: counts.none, backgroundColor: C.line }} /> : null}
            </View>
            <View style={st.tiles}>
              {['present', 'absent', 'leave', 'off', 'late', 'none'].map((s) => {
                const on = filter === 'st_' + s; const col = STATUS[s].color;
                return (
                  <TouchableOpacity key={s} activeOpacity={0.8} onPress={() => { anim(); setFilter(on ? 'all' : 'st_' + s); }}
                    style={[st.tile, { borderColor: col + '55' }, on && { backgroundColor: col, borderColor: col }]}>
                    <Ionicons name={STATUS[s].icon} size={16} color={on ? '#0A0A12' : col} />
                    <Text style={[st.tileN, { color: on ? '#0A0A12' : col }]}>{num(counts[s])}</Text>
                    <Text style={[st.tileL, on && { color: '#0A0A12' }]} numberOfLines={1}>{t.st[s]}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={st.actRow}>
              <TouchableOpacity onPress={markAllPresent} style={[st.actBtn, { backgroundColor: C.green, flex: 1.6 }]}>
                <Ionicons name="checkmark-done" size={16} color="#0A0A12" />
                <Text style={st.actTx} numberOfLines={1}>{t.allPresent}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={shareReport} style={[st.actBtn, { backgroundColor: C.cyan }]}>
                <Ionicons name="share-social" size={16} color="#0A0A12" />
                <Text style={st.actTx} numberOfLines={1}>{t.share}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={clearDay} style={[st.actBtn, { backgroundColor: C.card2, borderWidth: 1, borderColor: C.red + '88' }]}>
                <Ionicons name="refresh" size={16} color={C.red} />
                <Text style={[st.actTx, { color: C.red }]} numberOfLines={1}>{t.clearDay}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setBusOpen(true)} style={st.busStrip}>
              <Ionicons name="bus" size={18} color={C.green} />
              <Text style={st.busStripTx} numberOfLines={1}>
                {t.busR} <Text style={{ color: C.green, fontWeight: '900' }}>{num(busRiders('R').length)}</Text>
                {'   '}{t.busP} <Text style={{ color: C.cyan, fontWeight: '900' }}>{num(busRiders('P').length)}</Text>
              </Text>
              <Ionicons name="chevron-forward" size={16} color={C.muted} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity onPress={() => { anim(); setNoticeOpen(!noticeOpen); }} style={st.notice}>
        <Ionicons name="megaphone-outline" size={18} color={C.amber} />
        <Text style={st.noticeT}>{t.notice}</Text>
        <Ionicons name={noticeOpen ? 'chevron-up' : 'chevron-down'} size={18} color={C.muted} />
      </TouchableOpacity>
      {noticeOpen && (
        <View style={st.noticeBody}>
          {(data.rules[lang] || '').split('\n').filter(Boolean).map((r, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 6 }}>
              <Text style={{ color: C.amber, marginRight: 8 }}>●</Text>
              <Text style={st.ruleTx}>{r}</Text>
            </View>
          ))}
          <View style={{ flexDirection: 'row', marginTop: 6 }}>
            <TouchableOpacity onPress={() => call(data.shiftPhone)} style={[st.callBtn, { marginRight: 8 }]}>
              <Ionicons name="call" size={16} color="#0A0A12" />
              <View style={{ marginLeft: 6, flex: 1 }}>
                <Text style={st.callL} numberOfLines={1}>{t.callShift}</Text>
                <Text style={st.callN}>{data.shiftPhone || '—'}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => call(data.linePhone)} style={[st.callBtn, { backgroundColor: C.violet }]}>
              <Ionicons name="call" size={16} color="#0A0A12" />
              <View style={{ marginLeft: 6, flex: 1 }}>
                <Text style={st.callL} numberOfLines={1}>{t.callLine}</Text>
                <Text style={st.callN}>{data.linePhone || '—'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {hasWorkers && (
        <View>
          <View style={st.searchBox}>
            <Ionicons name="search" size={18} color={C.muted} />
            <TextInput value={q} onChangeText={setQ} placeholder={t.search} placeholderTextColor={C.muted} style={st.searchIn} />
            {q ? <TouchableOpacity onPress={() => setQ('')}><Ionicons name="close-circle" size={18} color={C.muted} /></TouchableOpacity> : null}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }} contentContainerStyle={{ paddingHorizontal: 16 }}>
            <Chip label={t.vStatus} icon="pulse" active={view === 'status'} color={C.pink} onPress={() => { anim(); setView('status'); }} />
            <Chip label={t.vJob} icon="layers" active={view === 'job'} color={C.pink} onPress={() => { anim(); setView('job'); }} />
            <Chip label={t.vList} icon="list" active={view === 'list'} color={C.pink} onPress={() => { anim(); setView('list'); }} />
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }} contentContainerStyle={{ paddingHorizontal: 16 }}>
            <Chip label={t.all} active={filter === 'all'} color={accent} onPress={() => setFilter('all')} />
            {warnCount > 0 && <Chip label={`${t.warn} ${num(warnCount)}`} icon="warning" active={filter === 'warn'} color={C.yellow} onPress={() => setFilter(filter === 'warn' ? 'all' : 'warn')} />}
            <Chip label={t.lead} icon="star" active={filter === 'lead'} color={accent} onPress={() => setFilter('lead')} />
            <Chip label={t.busR} icon="bus" active={filter === 'R'} color={accent} onPress={() => setFilter('R')} />
            <Chip label={t.busP} icon="boat" active={filter === 'P'} color={accent} onPress={() => setFilter('P')} />
            <Chip label={t.moved} icon="swap-horizontal" active={filter === 'moved'} color={accent} onPress={() => setFilter('moved')} />
            <Chip label={t.preg} icon="heart" active={filter === 'preg'} color={accent} onPress={() => setFilter('preg')} />
          </ScrollView>
          <Text style={st.hint}>{num(list.length)} {t.ppl} • {t.tapHint}</Text>
        </View>
      )}
    </View>
  );

  const Welcome = (
    <View style={st.welcome}>
      <View style={st.welcomeIcon}><Ionicons name="people" size={40} color="#0A0A12" /></View>
      <Text style={st.welcomeT}>{t.welcome}</Text>
      <Text style={st.welcomeS}>{t.welcomeSub}</Text>
      <TouchableOpacity onPress={importFromFile} style={[st.bigBtn, { backgroundColor: C.amber, alignSelf: 'stretch' }]}>
        <Ionicons name="document-attach" size={18} color="#0A0A12" /><Text style={st.bigBtnTx}>{t.importFile}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setPasteOpen(true)} style={[st.bigBtn, { backgroundColor: C.violet, alignSelf: 'stretch' }]}>
        <Ionicons name="clipboard" size={18} color="#0A0A12" /><Text style={st.bigBtnTx}>{t.paste}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => (admin ? openEdit(null) : setPinOpen(true))} style={[st.bigBtn, { backgroundColor: C.card2, alignSelf: 'stretch' }]}>
        <Ionicons name="person-add" size={18} color={C.text} /><Text style={[st.bigBtnTx, { color: C.text }]}>{admin ? t.add : t.emptyAdmin}</Text>
      </TouchableOpacity>
    </View>
  );

  /* ---------- detail data ---------- */
  let monthStats = null; let cal = []; let yearLeave = {}; let dRec = null; let monthOt = 0; let monthLate = 0;
  if (detail) {
    dRec = day[detail.id] || null;
    monthStats = { present: 0, absent: 0, leave: 0, off: 0, late: 0 };
    const pre = attDate.slice(0, 7); const yr = attDate.slice(0, 4);
    Object.keys(data.att).forEach((d) => {
      const r = data.att[d][detail.id]; if (!r) return;
      if (d.startsWith(pre)) {
        if (monthStats[r.s] !== undefined) monthStats[r.s]++;
        monthOt += otMins(r); monthLate += lateMins(detail, r);
      }
      if (d.startsWith(yr) && r.s === 'leave') { const k = r.lt || 'other'; yearLeave[k] = (yearLeave[k] || 0) + 1; }
    });
    const first = new Date(+pre.slice(0, 4), +pre.slice(5, 7) - 1, 1).getDay();
    for (let i = 0; i < first; i++) cal.push(null);
    for (let d = 1; d <= daysIn(pre); d++) {
      const iso = `${pre}-${pad(d)}`; const r = data.att[iso] && data.att[iso][detail.id];
      cal.push({ iso, d, s: r ? r.s : 'none' });
    }
  }
  const dStatus = dRec ? dRec.s : 'none';
  const dColor = detail ? (dStatus !== 'none' ? STATUS[dStatus].color : detail.shift === 1 ? C.amber : C.violet) : C.amber;
  const drOt = (() => { const a = toMin(normTime(dr.oi) || ''), b = toMin(normTime(dr.oo) || ''); return a === null || b === null ? 0 : (b - a + 1440) % 1440; })();
  const drLate = detail ? lateMins(detail, { s: 'late', arr: normTime(dr.arr) || '' }) : 0;

  /* ===================== RENDER ===================== */
  return (
    <SafeAreaView style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <SectionList
        sections={hasWorkers ? sections : []}
        keyExtractor={(w) => w.id}
        renderItem={renderItem}
        ListHeaderComponent={Header}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => {
          if (!section.title) return null;
          const col = section.status ? STATUS[section.status].color : accent;
          return (
            <View style={[st.secHead, section.status && { backgroundColor: col + '1A', borderColor: col + '55' }]}>
              {section.status
                ? <Ionicons name={STATUS[section.status].icon} size={18} color={col} style={{ marginRight: 8 }} />
                : <View style={[st.secDot, { backgroundColor: col }]} />}
              <Text style={[st.secTx, section.status && { color: col }]}>{section.title}</Text>
              <View style={[st.secBadge, { backgroundColor: col }]}><Text style={st.secN}>{num(section.data.length)}</Text></View>
            </View>
          );
        }}
        ListEmptyComponent={hasWorkers ? (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Ionicons name="search-outline" size={40} color={C.muted} />
            <Text style={{ color: C.muted, marginTop: 8 }}>{t.empty}</Text>
          </View>
        ) : Welcome}
        contentContainerStyle={{ paddingBottom: 110, paddingTop: Platform.OS === 'android' ? 28 : 0 }}
        keyboardShouldPersistTaps="handled"
      />

      {admin && (
        <TouchableOpacity style={[st.fab, { backgroundColor: accent }]} onPress={() => openEdit(null)}>
          <Ionicons name="person-add" size={24} color="#0A0A12" />
        </TouchableOpacity>
      )}

      {/* ---------- DETAIL ---------- */}
      <Modal visible={!!detail} transparent animationType="slide" onRequestClose={() => setDetailId(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={st.overlay}>
          {detail && (
            <View style={st.sheet}>
              <View style={st.grab} />
              <ScrollView style={{ maxHeight: 620 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={[st.bigAvatar, { borderColor: dColor }]}>
                  <Ionicons name={dStatus !== 'none' ? STATUS[dStatus].icon : detail.job === 'lead' ? 'star' : 'person'} size={34} color={dColor} />
                </View>
                <Text style={st.dName}>{nameOf(detail, lang)}</Text>
                <Text style={st.dId}>ID {detail.id} • {jobName(detail.job, lang)}</Text>
                <View style={st.dDate}>
                  <TouchableOpacity onPress={() => { const d = addDays(attDate, -1); setAttDate(d); loadDr(detail.id, d); }}><Ionicons name="chevron-back" size={18} color={C.text} /></TouchableOpacity>
                  <Text style={st.dDateTx}>{t.wd[parse(attDate).getDay()]}, {fmtDate(attDate, lang)}</Text>
                  <TouchableOpacity onPress={() => { const d = addDays(attDate, 1); setAttDate(d); loadDr(detail.id, d); }}><Ionicons name="chevron-forward" size={18} color={C.text} /></TouchableOpacity>
                </View>
                {isWarn(detail.id) && (
                  <View style={st.warnBox}>
                    <Ionicons name="warning" size={16} color="#0A0A12" />
                    <Text style={st.warnBoxTx}>{fill(t.warnTx, { n: num(absMonth[detail.id]) })}</Text>
                  </View>
                )}

                <SecTitle icon="pulse" text={t.status} />
                <View style={st.bigSeg}>
                  {SEG.map((k) => {
                    const on = dStatus === k; const K = STATUS[k];
                    return (
                      <TouchableOpacity key={k} onPress={() => { mark(detail, k); if (k === 'late' && !dr.arr && attDate === todayIso && dStatus !== 'late') setDr({ ...dr, arr: nowHM() }); }}
                        style={[st.bigSegBtn, { borderColor: K.color + '66' }, on && { backgroundColor: K.color, borderColor: K.color }]}>
                        <Ionicons name={K.icon} size={20} color={on ? '#0A0A12' : K.color} />
                        <Text style={[st.bigSegTx, { color: on ? '#0A0A12' : C.text }]} numberOfLines={1}>{t.st[k]}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {dStatus === 'leave' && (
                  <View>
                    <SecTitle icon="document-text" text={t.leaveType} color={STATUS.leave.color} />
                    <View style={st.wrap}>
                      {LTYPES.map((k) => (
                        <Chip key={k} icon={LT_ICON[k]} label={t.lt[k]} active={dRec.lt === k} color={STATUS.leave.color} onPress={() => patchRec(detail, { lt: k })} />
                      ))}
                    </View>
                  </View>
                )}

                {dStatus === 'late' && (
                  <View>
                    <SecTitle icon="alarm" text={t.arrival} color={STATUS.late.color} />
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TextInput value={dr.arr} onChangeText={(v) => setDr({ ...dr, arr: v })} placeholder="06:15" placeholderTextColor={C.muted}
                        keyboardType="numbers-and-punctuation" style={[st.input, st.timeIn]} />
                      <TouchableOpacity onPress={() => setDr({ ...dr, arr: nowHM() })} style={st.nowBtn}><Ionicons name="time" size={16} color={C.text} /></TouchableOpacity>
                      <Text style={[st.calcTx, { color: STATUS.late.color }]}>{t.lateBy} {num(drLate)} {t.min}</Text>
                    </View>
                    <Text style={st.smallMuted}>{t.time}: {detail.time || '—'}</Text>
                  </View>
                )}

                <SecTitle icon="flash" text={`${t.ot}`} color={C.yellow} />
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <Text style={st.fLbl}>{t.otIn}</Text>
                    <TextInput value={dr.oi} onChangeText={(v) => setDr({ ...dr, oi: v })} placeholder={shiftEnd(detail) || '15:00'} placeholderTextColor={C.muted}
                      keyboardType="numbers-and-punctuation" style={st.input} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 6 }}>
                    <Text style={st.fLbl}>{t.otOut}</Text>
                    <TextInput value={dr.oo} onChangeText={(v) => setDr({ ...dr, oo: v })} placeholder="18:00" placeholderTextColor={C.muted}
                      keyboardType="numbers-and-punctuation" style={st.input} />
                  </View>
                  <View style={st.otTotal}>
                    <Text style={st.otTotalN}>{num(hrs(drOt))}</Text>
                    <Text style={st.otTotalL}>{t.hrs}</Text>
                  </View>
                </View>
                <View style={[st.wrap, { marginTop: 8, marginBottom: 0 }]}>
                  {[1, 2, 3, 4].map((h) => (
                    <Chip key={h} icon="add" label={`${num(h)} ${t.hrs}`} color={C.yellow} onPress={() => quickOt(detail, h)} />
                  ))}
                  {(dr.oi || dr.oo) ? <Chip icon="trash" label={t.clearOt} color={C.red} onPress={() => clearOt(detail)} /> : null}
                </View>

                <SecTitle icon="create" text={t.note} color={C.cyan} />
                <TextInput value={dr.n} onChangeText={(v) => setDr({ ...dr, n: v })} placeholder={t.notePh} placeholderTextColor={C.muted} style={st.input} />

                <TouchableOpacity onPress={() => saveDr(detail)} style={[st.bigBtn, { backgroundColor: flash ? C.green : dColor }]}>
                  <Ionicons name={flash ? 'checkmark-circle' : 'save'} size={18} color="#0A0A12" />
                  <Text style={st.bigBtnTx}>{flash ? t.saved : t.saveRec}</Text>
                </TouchableOpacity>

                <SecTitle icon="calendar" text={`${t.calendar} • ${fmtMonth(attDate.slice(0, 7), lang)}`} />
                <View style={st.calWrap}>
                  {t.wdS.map((x, i) => <Text key={'h' + i} style={st.calHead}>{x}</Text>)}
                  {cal.map((c, i) => c ? (
                    <TouchableOpacity key={c.iso} style={st.calCell} onPress={() => { setAttDate(c.iso); loadDr(detail.id, c.iso); }}>
                      <View style={[st.calDot, { backgroundColor: c.s === 'none' ? C.card2 : STATUS[c.s].color, borderColor: c.iso === attDate ? C.text : c.iso === todayIso ? C.amber : 'transparent' }]}>
                        <Text style={[st.calTx, { color: c.s === 'none' ? C.muted : '#0A0A12' }]}>{num(c.d)}</Text>
                      </View>
                    </TouchableOpacity>
                  ) : <View key={'e' + i} style={st.calCell} />)}
                </View>

                <SecTitle icon="stats-chart" text={t.month} />
                <View style={st.monthRow}>
                  {SEG.map((k) => (
                    <View key={k} style={st.monthCell}>
                      <Text style={[st.monthN, { color: STATUS[k].color }]}>{num(monthStats[k])}</Text>
                      <Text style={st.monthL} numberOfLines={1}>{t.short[k]}</Text>
                    </View>
                  ))}
                </View>
                <View style={[st.monthRow, { marginTop: 6 }]}>
                  <View style={st.monthCell}><Text style={[st.monthN, { color: C.yellow }]}>{num(hrs(monthOt))}</Text><Text style={st.monthL}>{t.otHours}</Text></View>
                  <View style={st.monthCell}><Text style={[st.monthN, { color: STATUS.late.color }]}>{num(monthLate)}</Text><Text style={st.monthL}>{t.lateTotal}</Text></View>
                </View>

                <SecTitle icon="document-text" text={`${t.yearUse} (${lang === 'th' ? +attDate.slice(0, 4) + 543 : num(attDate.slice(0, 4))})`} color={STATUS.leave.color} />
                <View style={st.dBox}>
                  {LTYPES.map((k) => {
                    const used = yearLeave[k] || 0; const qt = data.quota[k];
                    return (
                      <View key={k} style={st.ltRow}>
                        <Ionicons name={LT_ICON[k]} size={14} color={STATUS.leave.color} />
                        <Text style={st.ltName}>{t.lt[k]}</Text>
                        {qt ? (
                          <View style={st.ltTrack}><View style={[st.ltFill, { width: `${Math.min(100, (used / qt) * 100)}%`, backgroundColor: used > qt ? C.red : STATUS.leave.color }]} /></View>
                        ) : <View style={{ flex: 1 }} />}
                        <Text style={[st.ltNum, used > (qt || 999) && { color: C.red }]}>{num(used)}{qt ? `/${num(qt)}` : ''}</Text>
                      </View>
                    );
                  })}
                </View>

                <SecTitle icon="language" text={t.names} />
                <View style={st.dBox}>
                  <Text style={st.dLine}><Text style={st.dK}>MM  </Text>{detail.mm || '—'}</Text>
                  <Text style={st.dLine}><Text style={st.dK}>TH  </Text>{detail.th || '—'}</Text>
                  <Text style={st.dLine}><Text style={st.dK}>EN  </Text>{detail.en || '—'}</Text>
                </View>
                <SecTitle icon="construct" text={t.jobAll} />
                <View style={st.dBox}>
                  <Text style={st.dLine}><Text style={st.dK}>MM  </Text>{jobName(detail.job, 'mm')}</Text>
                  <Text style={st.dLine}><Text style={st.dK}>TH  </Text>{jobName(detail.job, 'th')}</Text>
                  <Text style={st.dLine}><Text style={st.dK}>EN  </Text>{jobName(detail.job, 'en')}</Text>
                </View>
                <View style={st.grid}>
                  <View style={st.gCell}><Ionicons name="time" size={16} color={C.amber} /><Text style={st.gL}>{t.time}</Text><Text style={st.gV}>{detail.time || '—'}</Text></View>
                  <View style={st.gCell}><Ionicons name={detail.shift === 1 ? 'sunny' : 'moon'} size={16} color={C.violet} /><Text style={st.gL}>{t.shiftLbl}</Text><Text style={st.gV}>{detail.shift === 1 ? t.s1 : t.s2}</Text></View>
                  <View style={st.gCell}><Ionicons name="bus" size={16} color={C.green} /><Text style={st.gL}>{t.bus}</Text><Text style={st.gV}>{busLabel(detail.bus)}</Text></View>
                  <View style={st.gCell}><Ionicons name="information-circle" size={16} color={C.pink} /><Text style={st.gL}>{t.noteLbl}</Text><Text style={st.gV}>{detail.note ? noteLabel(detail.note) : t.none}</Text></View>
                </View>

                {admin && (
                  <View style={{ flexDirection: 'row', marginTop: 6, marginBottom: 10 }}>
                    <TouchableOpacity style={[st.aBtn, { backgroundColor: C.amber }]} onPress={() => openEdit(detail)}>
                      <Ionicons name="create" size={16} color="#0A0A12" /><Text style={st.aTx}>{t.edit}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[st.aBtn, { backgroundColor: C.violet }]} onPress={() => moveWorker(detail)}>
                      <Ionicons name="swap-horizontal" size={16} color="#0A0A12" /><Text style={st.aTx}>{t.move}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[st.aBtn, { backgroundColor: C.red }]} onPress={() => delWorker(detail)}>
                      <Ionicons name="trash" size={16} color="#0A0A12" /><Text style={st.aTx}>{t.del}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
              <TouchableOpacity style={st.closeBtn} onPress={() => setDetailId(null)}>
                <Ionicons name="close" size={22} color={C.text} />
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </Modal>

      {/* ---------- BUS ---------- */}
      <Modal visible={busOpen} transparent animationType="slide" onRequestClose={() => setBusOpen(false)}>
        <View style={st.overlay}>
          <View style={st.sheet}>
            <View style={st.grab} />
            <Text style={st.dName}>{t.busList}</Text>
            <Text style={st.dId}>{shift === 1 ? t.s1 : t.s2} • {fmtDate(attDate, lang)}</Text>
            <ScrollView style={{ maxHeight: 460 }}>
              {['R', 'P'].map((b) => {
                const ws = busRiders(b); const col = b === 'R' ? C.green : C.cyan;
                return (
                  <View key={b} style={[st.busCard, { borderColor: col + '66' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <Ionicons name={b === 'R' ? 'bus' : 'boat'} size={20} color={col} />
                      <Text style={[st.busName, { color: col }]}>{b === 'R' ? t.busR : t.busP}</Text>
                      <View style={[st.secBadge, { backgroundColor: col }]}><Text style={st.secN}>{num(ws.length)}</Text></View>
                    </View>
                    {ws.length ? ws.map((w, i) => (
                      <View key={w.id} style={st.busRow}>
                        <Text style={st.busIdx}>{num(i + 1)}</Text>
                        <Ionicons name={STATUS[stOf(w.id)].icon} size={14} color={STATUS[stOf(w.id)].color} />
                        <Text style={st.busWho} numberOfLines={1}>{nameOf(w, lang)}</Text>
                        <Text style={st.busTime}>{shiftStart(w)}</Text>
                      </View>
                    )) : <Text style={st.smallMuted}>{t.noRiders}</Text>}
                  </View>
                );
              })}
            </ScrollView>
            <TouchableOpacity onPress={shareBus} style={[st.bigBtn, { backgroundColor: C.green }]}>
              <Ionicons name="share-social" size={18} color="#0A0A12" /><Text style={st.bigBtnTx}>{t.share}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.closeBtn} onPress={() => setBusOpen(false)}><Ionicons name="close" size={22} color={C.text} /></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ---------- REPORT ---------- */}
      <Modal visible={repOpen} animationType="slide" onRequestClose={() => setRepOpen(false)}>
        <SafeAreaView style={st.root}>
          <View style={[st.top, { paddingTop: Platform.OS === 'android' ? 36 : 8 }]}>
            <TouchableOpacity onPress={() => setRepOpen(false)} style={st.iconBtn}><Ionicons name="close" size={20} color={C.text} /></TouchableOpacity>
            <Text style={[st.title, { flex: 1, marginLeft: 12, fontSize: 20 }]}>{t.report}</Text>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
            <View style={st.dateBar}>
              <TouchableOpacity onPress={() => setRepYm(addMonths(repYm, -1))} style={st.dateArrow}><Ionicons name="chevron-back" size={22} color={C.text} /></TouchableOpacity>
              <Text style={[st.dateBig, { flex: 1, textAlign: 'center' }]}>{fmtMonth(repYm, lang)}</Text>
              <TouchableOpacity onPress={() => setRepYm(addMonths(repYm, 1))} style={st.dateArrow}><Ionicons name="chevron-forward" size={22} color={C.text} /></TouchableOpacity>
            </View>
            <View style={st.wrap}>
              <Chip label={t.shiftAll} active={repShift === 'all'} color={C.pink} onPress={() => setRepShift('all')} />
              <Chip label={t.s1} icon="sunny" active={repShift === 1} color={C.amber} onPress={() => setRepShift(1)} />
              <Chip label={t.s2} icon="moon" active={repShift === 2} color={C.violet} onPress={() => setRepShift(2)} />
            </View>
            {(() => {
              const tot = { work: 0, absent: 0, leave: 0, off: 0, ot: 0, late: 0 };
              repWorkers.forEach((w) => { const a = repAgg[w.id]; if (!a) return; tot.work += a.present + a.late; tot.absent += a.absent; tot.leave += a.leave; tot.off += a.off; tot.ot += a.otMin; tot.late += a.lateMin; });
              const cells = [
                ['briefcase', C.green, num(tot.work), t.workDays], ['close-circle', C.red, num(tot.absent), t.st.absent],
                ['document-text', STATUS.leave.color, num(tot.leave), t.st.leave], ['bed', STATUS.off.color, num(tot.off), t.st.off],
                ['flash', C.yellow, num(hrs(tot.ot)), t.otHours], ['alarm', STATUS.late.color, num(tot.late), t.lateTotal],
              ];
              const anyData = tot.work + tot.absent + tot.leave + tot.off > 0;
              const sorted = [...repWorkers].filter((w) => repAgg[w.id]).sort((a, b) => (repAgg[b.id].absent - repAgg[a.id].absent) || (repAgg[b.id].leave - repAgg[a.id].leave) || (repAgg[b.id].otMin - repAgg[a.id].otMin));
              return (
                <View>
                  <View style={st.tiles}>
                    {cells.map(([ic, col, n, l]) => (
                      <View key={l} style={[st.tile, { borderColor: col + '55' }]}>
                        <Ionicons name={ic} size={16} color={col} />
                        <Text style={[st.tileN, { color: col }]}>{n}</Text>
                        <Text style={st.tileL} numberOfLines={1}>{l}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={st.actRow}>
                    <TouchableOpacity onPress={exportCsv} style={[st.actBtn, { backgroundColor: C.green }]}>
                      <Ionicons name="grid" size={16} color="#0A0A12" /><Text style={st.actTx} numberOfLines={1}>{t.exportCsv}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={shareMonthText} style={[st.actBtn, { backgroundColor: C.cyan }]}>
                      <Ionicons name="chatbubbles" size={16} color="#0A0A12" /><Text style={st.actTx} numberOfLines={1}>{t.shareTxt}</Text>
                    </TouchableOpacity>
                  </View>
                  {!anyData && <Text style={[st.smallMuted, { textAlign: 'center', marginTop: 16 }]}>{t.noData}</Text>}
                  {anyData && sorted.map((w, i) => {
                    const a = repAgg[w.id]; const warn = data.warnAbsent > 0 && a.absent >= data.warnAbsent;
                    return (
                      <View key={w.id} style={[st.repRow, warn && { borderColor: C.yellow + '88' }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={st.busIdx}>{num(i + 1)}</Text>
                          <Text style={st.repName} numberOfLines={1}>{nameOf(w, lang)}</Text>
                          {warn && <Ionicons name="warning" size={14} color={C.yellow} />}
                          <Text style={st.repId}>{w.id}</Text>
                        </View>
                        <View style={st.repStats}>
                          {[['checkmark-circle', C.green, a.present + a.late], ['close-circle', C.red, a.absent], ['document-text', STATUS.leave.color, a.leave],
                            ['bed', STATUS.off.color, a.off], ['alarm', STATUS.late.color, a.lateMin], ['flash', C.yellow, hrs(a.otMin)]].map(([ic, col, v], j) => (
                            <View key={j} style={st.repStat}><Ionicons name={ic} size={12} color={col} /><Text style={[st.repStatTx, { color: col }]}>{num(v)}</Text></View>
                          ))}
                        </View>
                      </View>
                    );
                  })}
                </View>
              );
            })()}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ---------- PASTE IMPORT ---------- */}
      <Modal visible={pasteOpen} transparent animationType="fade" onRequestClose={() => setPasteOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[st.overlay, { justifyContent: 'center', padding: 20 }]}>
          <View style={st.pinCard}>
            <Text style={st.pinT}>{t.paste}</Text>
            <TextInput value={pasteTx} onChangeText={setPasteTx} multiline placeholder={t.pastePh} placeholderTextColor={C.muted}
              style={[st.input, { minHeight: 180, maxHeight: 300, textAlignVertical: 'top', fontSize: 12 }]} />
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <TouchableOpacity style={[st.aBtn, { backgroundColor: C.card2 }]} onPress={() => setPasteOpen(false)}><Text style={[st.aTx, { color: C.text }]}>{t.cancel}</Text></TouchableOpacity>
              <TouchableOpacity style={[st.aBtn, { backgroundColor: C.amber }]} onPress={() => applyImport(pasteTx)}><Text style={st.aTx}>{t.importBtn}</Text></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ---------- PIN ---------- */}
      <Modal visible={pinOpen} transparent animationType="fade" onRequestClose={() => setPinOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[st.overlay, { justifyContent: 'center', padding: 24 }]}>
          <View style={st.pinCard}>
            <Ionicons name="lock-closed" size={30} color={C.amber} style={{ alignSelf: 'center' }} />
            <Text style={st.pinT}>{t.pinTitle}</Text>
            <TextInput value={pinIn} onChangeText={setPinIn} secureTextEntry keyboardType="number-pad" maxLength={8}
              style={st.pinIn} placeholder="••••" placeholderTextColor={C.muted} autoFocus onSubmitEditing={tryLogin} />
            <Text style={{ color: C.muted, fontSize: 11, textAlign: 'center', marginBottom: 12 }}>Default PIN: 1234</Text>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={[st.aBtn, { backgroundColor: C.card2 }]} onPress={() => { setPinOpen(false); setPinIn(''); }}>
                <Text style={[st.aTx, { color: C.text }]}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[st.aBtn, { backgroundColor: C.amber }]} onPress={tryLogin}><Text style={st.aTx}>{t.enter}</Text></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ---------- ADD / EDIT ---------- */}
      <Modal visible={!!form} animationType="slide" onRequestClose={() => setForm(null)}>
        {form && (
          <SafeAreaView style={st.root}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
              <View style={[st.top, { paddingTop: Platform.OS === 'android' ? 36 : 8 }]}>
                <TouchableOpacity onPress={() => setForm(null)} style={st.iconBtn}><Ionicons name="close" size={20} color={C.text} /></TouchableOpacity>
                <Text style={[st.title, { flex: 1, marginLeft: 12, fontSize: 20 }]}>{form._orig ? t.edit : t.add}</Text>
                <TouchableOpacity onPress={saveForm} style={[st.iconBtn, { backgroundColor: C.amber, borderColor: C.amber }]}><Ionicons name="checkmark" size={20} color="#0A0A12" /></TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
                <Field label={t.id} value={form.id} onChangeText={(v) => setForm({ ...form, id: v })} keyboardType="number-pad" placeholder="0123456" />
                <Field label={t.nameMm} value={form.mm} onChangeText={(v) => setForm({ ...form, mm: v })} />
                <Field label={t.nameTh} value={form.th} onChangeText={(v) => setForm({ ...form, th: v })} />
                <Field label={t.nameEn} value={form.en} onChangeText={(v) => setForm({ ...form, en: v })} />
                <Field label={t.time + ' (HH:MM-HH:MM)'} value={form.time} onChangeText={(v) => setForm({ ...form, time: v })} placeholder="06:00-15:00" />
                <Text style={st.fLbl}>{t.shiftLbl}</Text>
                <View style={st.wrap}>
                  <Chip label={t.s1} icon="sunny" active={form.shift === 1} color={C.amber} onPress={() => setForm({ ...form, shift: 1 })} />
                  <Chip label={t.s2} icon="moon" active={form.shift === 2} color={C.violet} onPress={() => setForm({ ...form, shift: 2 })} />
                </View>
                <Text style={st.fLbl}>{t.bus}</Text>
                <View style={st.wrap}>
                  <Chip label={t.noBus} active={form.bus === ''} onPress={() => setForm({ ...form, bus: '' })} />
                  <Chip label={t.busR} icon="bus" active={form.bus === 'R'} color={C.green} onPress={() => setForm({ ...form, bus: 'R' })} />
                  <Chip label={t.busP} icon="boat" active={form.bus === 'P'} color={C.cyan} onPress={() => setForm({ ...form, bus: 'P' })} />
                </View>
                <Text style={st.fLbl}>{t.noteLbl}</Text>
                <View style={st.wrap}>
                  {['', 'new', 'leave', 'from1', 'from2'].map((n) => (
                    <Chip key={n || 'none'} label={n ? noteLabel(n) : t.none} active={form.note === n} color={C.pink} onPress={() => setForm({ ...form, note: n })} />
                  ))}
                </View>
                <Text style={st.fLbl}>{t.job}</Text>
                <View style={st.wrap}>
                  {Object.keys(JOBS).map((k) => (
                    <Chip key={k} label={jobName(k, lang)} active={form.job === k} color={C.amber} onPress={() => setForm({ ...form, job: k })} />
                  ))}
                </View>
                <TouchableOpacity onPress={saveForm} style={[st.bigBtn, { backgroundColor: C.amber }]}>
                  <Ionicons name="save" size={18} color="#0A0A12" /><Text style={st.bigBtnTx}>{t.save}</Text>
                </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        )}
      </Modal>

      {/* ---------- SETTINGS ---------- */}
      <Modal visible={setOpen} animationType="slide" onRequestClose={() => setSetOpen(false)}>
        {sForm && (
          <SafeAreaView style={st.root}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
              <View style={[st.top, { paddingTop: Platform.OS === 'android' ? 36 : 8 }]}>
                <TouchableOpacity onPress={() => setSetOpen(false)} style={st.iconBtn}><Ionicons name="close" size={20} color={C.text} /></TouchableOpacity>
                <Text style={[st.title, { flex: 1, marginLeft: 12, fontSize: 20 }]}>{t.settings}</Text>
                <TouchableOpacity onPress={saveSettings} style={[st.iconBtn, { backgroundColor: C.amber, borderColor: C.amber }]}><Ionicons name="checkmark" size={20} color="#0A0A12" /></TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
                <SecTitle icon="cloud-done" text={t.cloud} color={C.green} />
                <View style={st.setCard}>
                  {data.sync.on ? (
                    <View>
                      <View style={st.switchRow}>
                        <Ionicons name={syncSt === 'err' ? 'cloud-offline' : 'cloud-done'} size={22} color={syncSt === 'err' ? C.red : C.green} />
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={st.switchTx}>{t.connectedTo}: {data.sync.project}</Text>
                          <Text style={st.smallMuted}>{t.lastSync}: {data.sync.lastOk ? new Date(data.sync.lastOk).toLocaleString() : '—'}</Text>
                          <Text style={st.smallMuted}>{t.pending}: {num(Object.keys(data.syncQ || {}).length + (data.rosterDirty ? 1 : 0))}</Text>
                          {syncSt === 'err' && syncErr ? <Text style={[st.smallMuted, { color: C.red }]} numberOfLines={3}>{syncErr}</Text> : null}
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => syncNow(true)} style={[st.bigBtn, { backgroundColor: C.green, marginTop: 0 }]}>
                        <Ionicons name="sync" size={18} color="#0A0A12" /><Text style={st.bigBtnTx}>{syncSt === 'busy' ? t.syncBusy : t.syncNow}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={shareConn} style={[st.bigBtn, { backgroundColor: C.card2, borderWidth: 1, borderColor: C.green }]}>
                        <Ionicons name="share-social" size={18} color={C.green} /><Text style={[st.bigBtnTx, { color: C.green }]}>{t.shareConn}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={disconnectCloud} style={[st.bigBtn, { backgroundColor: C.card2 }]}>
                        <Ionicons name="unlink" size={18} color={C.red} /><Text style={[st.bigBtnTx, { color: C.red }]}>{t.disconnect}</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View>
                      <Text style={[st.smallMuted, { marginTop: 0, marginBottom: 10 }]}>{t.cloudHint}</Text>
                      <Field label={t.connStr} value={cForm.conn} onChangeText={fillFromConn} autoCapitalize="none" autoCorrect={false} placeholder="WNL1|xxxx|sb_publishable_...|..." />
                      <Field label={t.projectId} value={cForm.project} onChangeText={(v) => setCForm({ ...cForm, project: v })} autoCapitalize="none" autoCorrect={false} />
                      <Field label={t.apiKey} value={cForm.key} onChangeText={(v) => setCForm({ ...cForm, key: v })} autoCapitalize="none" autoCorrect={false} />
                      <Field label={t.teamCode} value={cForm.code} onChangeText={(v) => setCForm({ ...cForm, code: v })} autoCapitalize="none" autoCorrect={false} />
                      <TouchableOpacity onPress={connectCloud} style={[st.bigBtn, { backgroundColor: C.green, marginTop: 0 }]}>
                        <Ionicons name={syncSt === 'busy' ? 'hourglass' : 'cloud-upload'} size={18} color="#0A0A12" /><Text style={st.bigBtnTx}>{syncSt === 'busy' ? t.syncBusy : t.connect}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <SecTitle icon="cloud" text={t.dataSec} color={C.cyan} />
                <View style={st.setCard}>
                  <Text style={st.smallMuted}>
                    {t.lastBackup}: {data.lastBackup ? `${fmtDate(data.lastBackup, lang)} (${num(backupAge)} ${t.daysAgo})` : t.never}
                  </Text>
                  <Text style={[st.smallMuted, { marginBottom: 4 }]}>{t.backupHint}</Text>
                  <TouchableOpacity onPress={doBackup} style={[st.bigBtn, { backgroundColor: C.cyan }]}>
                    <Ionicons name="cloud-upload" size={18} color="#0A0A12" /><Text style={st.bigBtnTx}>{t.backup}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={importFromFile} style={[st.bigBtn, { backgroundColor: C.card2, borderWidth: 1, borderColor: C.cyan }]}>
                    <Ionicons name="cloud-download" size={18} color={C.cyan} /><Text style={[st.bigBtnTx, { color: C.cyan }]}>{t.restore}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setPasteOpen(true)} style={[st.bigBtn, { backgroundColor: C.card2 }]}>
                    <Ionicons name="clipboard" size={18} color={C.text} /><Text style={[st.bigBtnTx, { color: C.text }]}>{t.paste}</Text>
                  </TouchableOpacity>
                </View>

                <SecTitle icon="document-text" text={t.leaveSec} color={STATUS.leave.color} />
                <View style={st.setCard}>
                  <Text style={st.fLbl}>{t.quota}</Text>
                  <View style={{ flexDirection: 'row' }}>
                    {[['qs', 'sick'], ['qp', 'personal'], ['qa', 'annual']].map(([k, lt]) => (
                      <View key={k} style={{ flex: 1, marginHorizontal: 3 }}>
                        <Text style={[st.smallMuted, { textAlign: 'center' }]} numberOfLines={1}>{t.lt[lt]}</Text>
                        <TextInput value={sForm[k]} onChangeText={(v) => setSForm({ ...sForm, [k]: v })} keyboardType="number-pad" style={[st.input, { textAlign: 'center' }]} />
                      </View>
                    ))}
                  </View>
                  <View style={{ height: 12 }} />
                  <Field label={t.warnLbl} value={sForm.wa} onChangeText={(v) => setSForm({ ...sForm, wa: v })} keyboardType="number-pad" />
                </View>

                <SecTitle icon="call" text={t.contactSec} color={C.green} />
                <View style={st.setCard}>
                  <Field label={t.shiftSup} value={sForm.shiftPhone} onChangeText={(v) => setSForm({ ...sForm, shiftPhone: v })} keyboardType="phone-pad" />
                  <Field label={t.lineSup} value={sForm.linePhone} onChangeText={(v) => setSForm({ ...sForm, linePhone: v })} keyboardType="phone-pad" />
                  {['mm', 'th', 'en'].map((l) => (
                    <Field key={l} label={`${t.rulesLbl} (${l.toUpperCase()})`} multiline value={sForm.rules[l]}
                      onChangeText={(v) => setSForm({ ...sForm, rules: { ...sForm.rules, [l]: v } })} />
                  ))}
                </View>

                <SecTitle icon="shield-checkmark" text={t.secSec} color={C.amber} />
                <View style={st.setCard}>
                  <View style={st.switchRow}>
                    <Ionicons name="lock-closed" size={18} color={C.amber} />
                    <Text style={st.switchTx}>{t.lockAtt}</Text>
                    <Switch value={sForm.lockAtt} onValueChange={(v) => setSForm({ ...sForm, lockAtt: v })} trackColor={{ false: C.line, true: C.amber }} thumbColor={C.text} />
                  </View>
                  <Field label={t.newPin} value={sForm.pin} onChangeText={(v) => setSForm({ ...sForm, pin: v })} keyboardType="number-pad" secureTextEntry maxLength={8} />
                </View>

                <TouchableOpacity onPress={saveSettings} style={[st.bigBtn, { backgroundColor: C.amber }]}>
                  <Ionicons name="save" size={18} color="#0A0A12" /><Text style={st.bigBtnTx}>{t.save}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={clearAllAtt} style={[st.bigBtn, { backgroundColor: C.card2, borderWidth: 1, borderColor: C.red }]}>
                  <Ionicons name="trash" size={18} color={C.red} /><Text style={[st.bigBtnTx, { color: C.red }]}>{t.clearAll}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setAdmin(false); setSetOpen(false); }} style={[st.bigBtn, { backgroundColor: C.card2 }]}>
                  <Ionicons name="log-out-outline" size={18} color={C.text} /><Text style={[st.bigBtnTx, { color: C.text }]}>{t.logout}</Text>
                </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

/* ===================== STYLES ===================== */
const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  title: { color: C.text, fontSize: 26, fontWeight: '900', lineHeight: 38 },
  sub: { color: C.muted, fontSize: 12, lineHeight: 20 },
  iconBtn: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', backgroundColor: C.card },

  langRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  langBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, marginRight: 6 },
  langOn: { backgroundColor: C.text, borderColor: C.text },
  langTx: { color: C.text, fontWeight: '700', fontSize: 13, lineHeight: 20 },

  adminBar: { marginHorizontal: 16, marginBottom: 10, backgroundColor: C.amber, borderRadius: 10, paddingVertical: 5, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  adminBarTx: { color: '#0A0A12', fontWeight: '900', marginLeft: 6, letterSpacing: 2, fontSize: 12, lineHeight: 20 },
  cloudPill: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, paddingHorizontal: 9, paddingVertical: 5, backgroundColor: C.card },
  cloudN: { fontWeight: '900', fontSize: 12, marginLeft: 4 },
  remind: { marginHorizontal: 16, marginBottom: 10, backgroundColor: C.cyan, borderRadius: 14, padding: 10, flexDirection: 'row', alignItems: 'center' },
  remindTx: { color: '#0A0A12', fontWeight: '800', marginLeft: 8, flex: 1, fontSize: 12, lineHeight: 20 },

  dateBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 10, backgroundColor: C.card, borderRadius: 20, padding: 6, borderWidth: 1, borderColor: C.line },
  dateArrow: { width: 44, height: 44, borderRadius: 14, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center' },
  dateWd: { color: C.muted, fontSize: 12, lineHeight: 20 },
  dateBig: { color: C.text, fontSize: 17, fontWeight: '900', lineHeight: 28 },
  todayBtn: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: C.amber, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginTop: -4, marginBottom: 10 },
  todayTx: { color: '#0A0A12', fontWeight: '900', marginLeft: 5, fontSize: 12, lineHeight: 20 },

  shiftRow: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 12 },
  shiftCard: { flex: 1, backgroundColor: C.card, borderRadius: 22, padding: 14, borderWidth: 1.5, borderColor: C.line, marginHorizontal: 4 },
  shiftHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shiftBig: { fontSize: 30, fontWeight: '900' },
  shiftName: { fontSize: 18, fontWeight: '900', marginTop: 6, lineHeight: 28 },
  shiftSub: { fontSize: 11, lineHeight: 18 },
  miniTrack: { height: 5, borderRadius: 3, overflow: 'hidden', marginTop: 8, marginBottom: 2 },
  miniFill: { height: 5, borderRadius: 3 },

  attCard: { marginHorizontal: 16, backgroundColor: C.card, borderRadius: 22, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.line },
  attTitle: { color: C.text, fontWeight: '900', fontSize: 16, marginLeft: 8, flex: 1, lineHeight: 26 },
  attPct: { fontWeight: '900', fontSize: 18 },
  track: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', backgroundColor: C.line, marginBottom: 12 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tile: { width: '32%', backgroundColor: C.card2, borderRadius: 16, paddingVertical: 10, alignItems: 'center', marginBottom: 8, borderWidth: 1 },
  tileN: { fontSize: 22, fontWeight: '900', marginTop: 2 },
  tileL: { color: C.muted, fontSize: 11, lineHeight: 18, paddingHorizontal: 4 },
  actRow: { flexDirection: 'row', marginTop: 4 },
  actBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14, paddingVertical: 11, marginHorizontal: 3, paddingHorizontal: 6 },
  actTx: { color: '#0A0A12', fontWeight: '900', fontSize: 12, marginLeft: 5, lineHeight: 20, flexShrink: 1 },
  busStrip: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card2, borderRadius: 14, padding: 10, marginTop: 10 },
  busStripTx: { color: C.text, flex: 1, marginLeft: 8, fontSize: 12, lineHeight: 20 },

  notice: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, backgroundColor: C.card2, borderRadius: 14, padding: 12 },
  noticeT: { color: C.text, fontWeight: '700', flex: 1, marginLeft: 8, lineHeight: 22 },
  noticeBody: { marginHorizontal: 16, backgroundColor: C.card, borderRadius: 14, padding: 12, marginTop: 6, borderWidth: 1, borderColor: C.line },
  ruleTx: { color: C.text, flex: 1, fontSize: 13, lineHeight: 22 },
  callBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: C.amber, borderRadius: 12, padding: 10 },
  callL: { color: '#0A0A12', fontSize: 11, fontWeight: '700', lineHeight: 18 },
  callN: { color: '#0A0A12', fontSize: 13, fontWeight: '900' },

  searchBox: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12, marginBottom: 10, backgroundColor: C.card, borderRadius: 16, paddingHorizontal: 12, borderWidth: 1, borderColor: C.line },
  searchIn: { flex: 1, color: C.text, paddingVertical: 11, marginLeft: 8, fontSize: 14 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: C.line, backgroundColor: C.card, marginRight: 6, marginBottom: 6 },
  chipTx: { color: C.text, fontSize: 12, lineHeight: 20 },
  hint: { color: C.muted, fontSize: 11, marginHorizontal: 16, marginBottom: 4, lineHeight: 18 },

  secHead: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 14, marginBottom: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, borderWidth: 1, borderColor: 'transparent' },
  secDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  secTx: { color: C.text, fontWeight: '900', flex: 1, lineHeight: 24, fontSize: 15 },
  secBadge: { minWidth: 30, paddingHorizontal: 8, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  secN: { fontWeight: '900', color: '#0A0A12' },

  row: { backgroundColor: C.card, marginHorizontal: 16, marginBottom: 8, borderRadius: 18, padding: 12, paddingLeft: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.line },
  rowTop: { flexDirection: 'row', alignItems: 'center' },
  rowBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  avatar: { width: 40, height: 40, borderRadius: 13, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: C.card2 },
  avatarTx: { fontWeight: '900', fontSize: 14 },
  name: { color: C.text, fontSize: 16, fontWeight: '800', lineHeight: 26, flexShrink: 1 },
  subName: { color: C.muted, fontSize: 11, lineHeight: 18 },
  rowTags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 2 },
  rowNote: { fontSize: 12, marginTop: 3, lineHeight: 20, flexShrink: 1 },
  tag: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, marginRight: 4, marginTop: 3 },
  tagTx: { fontSize: 11, fontWeight: '700', lineHeight: 18 },
  timeBox: { alignItems: 'center', marginLeft: 8, minWidth: 48 },
  timeTx: { color: C.text, fontWeight: '800', fontSize: 13, marginTop: 2 },
  timeTx2: { color: C.muted, fontSize: 11 },
  seg: { flexDirection: 'row', marginTop: 10 },
  segBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 7, marginHorizontal: 2, borderRadius: 11, borderWidth: 1, backgroundColor: C.card2 },
  segTx: { fontSize: 11, marginLeft: 3, fontWeight: '700', lineHeight: 18, flexShrink: 1 },

  fab: { position: 'absolute', right: 20, bottom: 30, width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 8 },

  welcome: { margin: 16, marginTop: 20, padding: 20, backgroundColor: C.card, borderRadius: 24, borderWidth: 1, borderColor: C.line, alignItems: 'center' },
  welcomeIcon: { width: 76, height: 76, borderRadius: 26, backgroundColor: C.amber, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  welcomeT: { color: C.text, fontSize: 20, fontWeight: '900', textAlign: 'center', lineHeight: 32 },
  welcomeS: { color: C.muted, fontSize: 13, textAlign: 'center', lineHeight: 22, marginTop: 6, marginBottom: 6 },

  overlay: { flex: 1, backgroundColor: '#000000AA', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 24, borderWidth: 1, borderColor: C.line },
  grab: { width: 44, height: 5, borderRadius: 3, backgroundColor: C.line, alignSelf: 'center', marginBottom: 14 },
  bigAvatar: { width: 70, height: 70, borderRadius: 24, borderWidth: 2, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', backgroundColor: C.card2 },
  dName: { color: C.text, fontSize: 22, fontWeight: '900', textAlign: 'center', marginTop: 10, lineHeight: 34 },
  dId: { color: C.muted, textAlign: 'center', marginBottom: 6, lineHeight: 20 },
  dDate: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', backgroundColor: C.card2, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6 },
  dDateTx: { color: C.text, fontWeight: '800', marginHorizontal: 10, fontSize: 13, lineHeight: 20 },
  warnBox: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', backgroundColor: C.yellow, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, marginTop: 8 },
  warnBoxTx: { color: '#0A0A12', fontWeight: '900', marginLeft: 6, fontSize: 12, lineHeight: 20 },
  secTitleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 8 },
  secTitleTx: { fontWeight: '900', fontSize: 13, marginLeft: 6, lineHeight: 22 },
  bigSeg: { flexDirection: 'row', justifyContent: 'space-between' },
  bigSegBtn: { width: '19%', alignItems: 'center', paddingVertical: 10, borderRadius: 14, borderWidth: 1, backgroundColor: C.card2 },
  bigSegTx: { fontSize: 10, fontWeight: '800', marginTop: 4, lineHeight: 16 },
  timeIn: { width: 100, textAlign: 'center', fontSize: 18, fontWeight: '800' },
  nowBtn: { width: 42, height: 44, borderRadius: 12, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  calcTx: { marginLeft: 12, fontWeight: '900', fontSize: 14, flex: 1, lineHeight: 22 },
  smallMuted: { color: C.muted, fontSize: 12, marginTop: 4, lineHeight: 20 },
  otTotal: { width: 64, height: 64, borderRadius: 18, backgroundColor: C.yellow, alignItems: 'center', justifyContent: 'center', marginLeft: 10, marginTop: 18 },
  otTotalN: { color: '#0A0A12', fontWeight: '900', fontSize: 20 },
  otTotalL: { color: '#0A0A12', fontWeight: '800', fontSize: 11, lineHeight: 16 },
  calWrap: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: C.card2, borderRadius: 16, padding: 6 },
  calHead: { width: '14.28%', textAlign: 'center', color: C.muted, fontSize: 10, marginBottom: 4, lineHeight: 18 },
  calCell: { width: '14.28%', alignItems: 'center', marginBottom: 6 },
  calDot: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  calTx: { fontSize: 12, fontWeight: '800' },
  monthRow: { flexDirection: 'row', backgroundColor: C.card2, borderRadius: 14, paddingVertical: 10 },
  monthCell: { flex: 1, alignItems: 'center' },
  monthN: { fontSize: 20, fontWeight: '900' },
  monthL: { color: C.muted, fontSize: 11, lineHeight: 18 },
  ltRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  ltName: { color: C.text, fontSize: 13, marginLeft: 6, width: 110, lineHeight: 22 },
  ltTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: C.line, overflow: 'hidden', marginHorizontal: 8 },
  ltFill: { height: 8, borderRadius: 4 },
  ltNum: { color: C.text, fontWeight: '900', fontSize: 13, minWidth: 44, textAlign: 'right' },
  dBox: { backgroundColor: C.card2, borderRadius: 14, padding: 12 },
  dLine: { color: C.text, fontSize: 14, lineHeight: 26 },
  dK: { color: C.muted, fontWeight: '900', fontSize: 11 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, justifyContent: 'space-between' },
  gCell: { width: '48.5%', backgroundColor: C.card2, borderRadius: 14, padding: 10, marginBottom: 8 },
  gL: { color: C.muted, fontSize: 11, marginTop: 4, lineHeight: 18 },
  gV: { color: C.text, fontWeight: '800', fontSize: 14, lineHeight: 24 },
  aBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 14, marginHorizontal: 4 },
  aTx: { color: '#0A0A12', fontWeight: '900', marginLeft: 5, fontSize: 13, lineHeight: 20 },
  closeBtn: { position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 12, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center' },

  busCard: { backgroundColor: C.card2, borderRadius: 16, padding: 12, marginTop: 10, borderWidth: 1 },
  busName: { fontWeight: '900', fontSize: 15, flex: 1, marginLeft: 8, lineHeight: 24 },
  busRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, borderTopWidth: 1, borderTopColor: C.line },
  busIdx: { color: C.muted, width: 26, fontSize: 12 },
  busWho: { color: C.text, flex: 1, marginLeft: 6, fontSize: 14, lineHeight: 22 },
  busTime: { color: C.muted, fontSize: 12 },

  repRow: { backgroundColor: C.card, borderRadius: 14, padding: 10, marginTop: 8, borderWidth: 1, borderColor: C.line },
  repName: { color: C.text, fontWeight: '800', flex: 1, fontSize: 14, lineHeight: 22, marginRight: 6 },
  repId: { color: C.muted, fontSize: 11, marginLeft: 6 },
  repStats: { flexDirection: 'row', marginTop: 6, paddingLeft: 26 },
  repStat: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  repStatTx: { fontWeight: '900', fontSize: 12, marginLeft: 3 },

  pinCard: { backgroundColor: C.card, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: C.line },
  pinT: { color: C.text, fontSize: 18, fontWeight: '900', textAlign: 'center', marginVertical: 10, lineHeight: 28 },
  pinIn: { backgroundColor: C.card2, color: C.text, fontSize: 24, textAlign: 'center', letterSpacing: 10, borderRadius: 14, paddingVertical: 12, marginBottom: 8 },

  setCard: { backgroundColor: C.card, borderRadius: 18, padding: 12, borderWidth: 1, borderColor: C.line },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  switchTx: { color: C.text, flex: 1, marginLeft: 10, fontWeight: '700', lineHeight: 22 },
  fLbl: { color: C.muted, fontSize: 12, marginBottom: 6, fontWeight: '700', lineHeight: 20 },
  input: { backgroundColor: C.card2, color: C.text, borderRadius: 14, borderWidth: 1, borderColor: C.line, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  bigBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, paddingVertical: 14, marginTop: 10 },
  bigBtnTx: { color: '#0A0A12', fontWeight: '900', marginLeft: 8, fontSize: 15, lineHeight: 22 },
});
