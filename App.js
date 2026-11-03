import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, SectionList, TouchableOpacity, TextInput, Modal,
  ScrollView, Alert, StatusBar, Linking, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ===================== THEME ===================== */
const C = {
  bg: '#0A0A12', card: '#151522', card2: '#1D1D2E', line: '#2A2A40',
  text: '#F5F5FA', muted: '#8C8CA8', amber: '#FFB020', violet: '#A78BFA',
  pink: '#FF5C8A', green: '#34D399', cyan: '#22D3EE', red: '#F87171',
};
const KEY = 'betagro_roster_v1';

/* ===================== UI TEXT (3 LANG) ===================== */
const T = {
  mm: {
    title: 'ဝန်ထမ်းစာရင်း', sub: 'Betagro • နခွန်ပထုံ ဝက်သတ်ရုံ', s1: 'ဆိုင်း ၁', s2: 'ဆိုင်း ၂',
    day: 'မနက်ဆိုင်း', night: 'ညနေ/ညဆိုင်း', search: 'နာမည် သို့ ID ဖြင့်ရှာပါ...', all: 'အားလုံး',
    busR: 'ရာဘာစက်ရုံကား', busP: 'ငါးဆိပ်ကား', moved: 'ဆိုင်းပြောင်း', preg: 'ကိုယ်ဝန်ဆောင်', lead: 'ခေါင်းဆောင်',
    total: 'စုစုပေါင်း', ppl: 'ယောက်', job: 'တာဝန်', time: 'အလုပ်ချိန်', id: 'ဝန်ထမ်းနံပါတ်', bus: 'ကားလိုင်း',
    noBus: 'ကိုယ်တိုင်လာ', new: 'အသစ်', leave: 'မီးဖွားခွင့်', from1: 'ဆိုင်း၁ မှ ပြောင်းလာ', from2: 'ဆိုင်း၂ မှ ပြောင်းလာ',
    date: 'ရက်စွဲ', notice: 'စည်းကမ်းနှင့် ဆက်သွယ်ရန်', callShift: 'ဆိုင်းခေါင်းဆောင်', callLine: 'လိုင်းခေါင်းဆောင်',
    groupJob: 'တာဝန်အလိုက်', list: 'စာရင်း', pinTitle: 'Admin PIN ထည့်ပါ', pinWrong: 'PIN မှားနေသည်',
    enter: 'ဝင်မည်', cancel: 'မလုပ်တော့', save: 'သိမ်းမည်', edit: 'ပြင်မည်', del: 'ဖျက်မည်',
    delQ: 'ဒီဝန်ထမ်းကို ဖျက်မှာ သေချာလား?', move: 'ဆိုင်းပြောင်းမည်', add: 'ဝန်ထမ်းအသစ်ထည့်',
    nameTh: 'နာမည် (ထိုင်း)', nameMm: 'နာမည် (မြန်မာ)', nameEn: 'နာမည် (English)', shiftLbl: 'ဆိုင်း',
    noteLbl: 'အခြေအနေ', none: 'မရှိ', settings: 'Admin ဆက်တင်', newPin: 'PIN အသစ် (ပြောင်းချင်မှ ဖြည့်)',
    reset: 'မူရင်းစာရင်းသို့ ပြန်ထားမည်', resetQ: 'ပြင်ထားသမျှ ပျက်မည်။ သေချာလား?', shiftSup: 'ဆိုင်းခေါင်းဆောင် ဖုန်း',
    lineSup: 'လိုင်းခေါင်းဆောင် ဖုန်း', empty: 'ရှာမတွေ့ပါ', required: 'ID နှင့် နာမည်တစ်ခုခု လိုအပ်သည်',
    yes: 'ဟုတ်ကဲ့', idExists: 'ဒီ ID ရှိပြီးသားပါ', names: 'နာမည် ၃ ဘာသာ', rulesLbl: 'စည်းကမ်း',
    logout: 'Admin မှ ထွက်မည်', saved: 'သိမ်းပြီးပါပြီ', adminMode: 'ADMIN MODE', dateFmt: 'ရက်စွဲ (YYYY-MM-DD)',
    jobAll: 'တာဝန် ၃ ဘာသာ', tapHint: 'နာမည်ကိုနှိပ်ပြီး အသေးစိတ်ကြည့်ပါ',
  },
  th: {
    title: 'รายชื่อพนักงาน', sub: 'เบทาโกร • โรงฆ่าสุกรนครปฐม', s1: 'กะ 1', s2: 'กะ 2',
    day: 'กะเช้า', night: 'กะบ่าย-ดึก', search: 'ค้นหาชื่อหรือรหัส...', all: 'ทั้งหมด',
    busR: 'สายรถโรงยาง', busP: 'สายรถแพปลา', moved: 'ย้ายกะ', preg: 'ตั้งครรภ์', lead: 'หัวหน้า',
    total: 'ทั้งหมด', ppl: 'คน', job: 'จุดงาน', time: 'เวลาทำงาน', id: 'รหัสพนักงาน', bus: 'สายรถ',
    noBus: 'มาเอง', new: 'คนใหม่', leave: 'ลาคลอด', from1: 'ย้ายมาจากกะ 1', from2: 'ย้ายมาจากกะ 2',
    date: 'ประจำวันที่', notice: 'ข้อปฏิบัติ & ติดต่อ', callShift: 'หัวหน้ากะ', callLine: 'หัวหน้าสาย',
    groupJob: 'ตามจุดงาน', list: 'รายชื่อ', pinTitle: 'ใส่ PIN แอดมิน', pinWrong: 'PIN ไม่ถูกต้อง',
    enter: 'เข้าสู่ระบบ', cancel: 'ยกเลิก', save: 'บันทึก', edit: 'แก้ไข', del: 'ลบ',
    delQ: 'ยืนยันลบพนักงานคนนี้?', move: 'ย้ายกะ', add: 'เพิ่มพนักงาน',
    nameTh: 'ชื่อ (ไทย)', nameMm: 'ชื่อ (พม่า)', nameEn: 'ชื่อ (อังกฤษ)', shiftLbl: 'กะ',
    noteLbl: 'สถานะ', none: 'ไม่มี', settings: 'ตั้งค่าแอดมิน', newPin: 'PIN ใหม่ (ใส่เมื่อต้องการเปลี่ยน)',
    reset: 'คืนค่ารายชื่อเดิม', resetQ: 'ข้อมูลที่แก้ไขจะหายทั้งหมด ยืนยัน?', shiftSup: 'เบอร์หัวหน้ากะ',
    lineSup: 'เบอร์หัวหน้าสาย', empty: 'ไม่พบข้อมูล', required: 'ต้องมีรหัสและชื่ออย่างน้อยหนึ่งภาษา',
    yes: 'ยืนยัน', idExists: 'รหัสนี้มีอยู่แล้ว', names: 'ชื่อ 3 ภาษา', rulesLbl: 'ข้อปฏิบัติ',
    logout: 'ออกจากแอดมิน', saved: 'บันทึกแล้ว', adminMode: 'โหมดแอดมิน', dateFmt: 'วันที่ (YYYY-MM-DD)',
    jobAll: 'จุดงาน 3 ภาษา', tapHint: 'แตะชื่อเพื่อดูรายละเอียด',
  },
  en: {
    title: 'Staff Roster', sub: 'Betagro • Nakhon Pathom Swine Slaughterhouse', s1: 'Shift 1', s2: 'Shift 2',
    day: 'Morning shift', night: 'Evening/Night shift', search: 'Search name or ID...', all: 'All',
    busR: 'Rubber Factory Bus', busP: 'Fish Pier Bus', moved: 'Moved', preg: 'Pregnant', lead: 'Supervisor',
    total: 'Total', ppl: 'people', job: 'Job', time: 'Work hours', id: 'Employee ID', bus: 'Bus route',
    noBus: 'Own transport', new: 'New', leave: 'Maternity leave', from1: 'Moved from Shift 1', from2: 'Moved from Shift 2',
    date: 'Date', notice: 'Rules & Contacts', callShift: 'Shift Supervisor', callLine: 'Line Supervisor',
    groupJob: 'By job', list: 'List', pinTitle: 'Enter Admin PIN', pinWrong: 'Wrong PIN',
    enter: 'Login', cancel: 'Cancel', save: 'Save', edit: 'Edit', del: 'Delete',
    delQ: 'Delete this worker?', move: 'Move shift', add: 'Add worker',
    nameTh: 'Name (Thai)', nameMm: 'Name (Myanmar)', nameEn: 'Name (English)', shiftLbl: 'Shift',
    noteLbl: 'Status', none: 'None', settings: 'Admin Settings', newPin: 'New PIN (only to change)',
    reset: 'Reset to original list', resetQ: 'All edits will be lost. Continue?', shiftSup: 'Shift supervisor phone',
    lineSup: 'Line supervisor phone', empty: 'Nothing found', required: 'ID and at least one name are required',
    yes: 'Yes', idExists: 'This ID already exists', names: 'Name in 3 languages', rulesLbl: 'Rules',
    logout: 'Exit Admin', saved: 'Saved', adminMode: 'ADMIN MODE', dateFmt: 'Date (YYYY-MM-DD)',
    jobAll: 'Job in 3 languages', tapHint: 'Tap a name for details',
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

/* ===================== DATA FROM THE SHEETS (4/11/2569) =====================
   [id, Thai, Myanmar, English, job, time(null=default, ''=not set), bus R/P, note] */
const S1 = [
  ['0079072', 'ศิรินันทร์ ศรีสุขสร้อย', 'စိရိနန် သီရိစုခ်ဆွိုင်', 'Sirinan Srisuksoi', 'lead', '05:30-14:30'],
  ['0180400', 'จ่อ', 'ကျော်', 'Kyaw', 'lead', '05:30-14:30'],
  ['0240740', 'ยา ซา พิว', 'ရာဇာဖြိုး', 'Yar Zar Phyo', 'recv', '03:00-12:00'],
  ['0200975', 'จไร เยือก', 'ဂျာရိုင် ယွတ်', 'Jarai Yuak', 'recv', '03:00-12:00'],
  ['0228875', 'ดูลิน ทุน', 'ဒူလင်းထွန်း', 'Du Lin Tun', 'recv', '03:00-12:00'],
  ['0183537', 'เซ ซาน นิ', 'ဇေဇံနီ', 'Zay Zan Ni', 'hangPierce', '05:30-14:30'],
  ['0178083', 'ซอ เท็ด ปาย', 'စောထက်ပိုင်', 'Saw Htet Paing', 'hangPierce', '05:30-14:30'],
  ['0167396', 'อู', 'ဦး', 'Oo', 'stick', '05:30-14:30'],
  ['0178080', 'ไว ลิน คุน', 'ဝေလင်းခွန်', 'Wai Lin Khun', 'openWhite', '05:30-14:30'],
  ['0184417', 'กอง เทะ ฮิน', 'ကောင်းထက်ဟိန်း', 'Kaung Htet Hein', 'drive', '05:30-14:30', 'R'],
  ['0178085', 'เท็ด ลิน จอ', 'ထက်လင်းကျော်', 'Htet Lin Kyaw', 'split', '05:30-14:30'],
  ['0178079', 'กอ ลิน จอ', 'ကိုလင်းကျော်', 'Ko Lin Kyaw', 'weight', '07:00-14:30'],
  ['0207341', 'ทูน ทูน', 'ထွန်းထွန်း', 'Tun Tun', 'boilBlood'],
  ['0108839', 'ณัชชา วุฒิยาสาร', 'နတ်ချာ ဝုတ်ထိယာဆန်', 'Natcha Wuttiyasan', 'spine'],
  ['0183542', 'สุ่ย ชิน อู่', 'ဆွေစင်ဦး', 'Swe Sin Oo', 'scrapeBody', null, 'P'],
  ['0228872', 'ซา ปา อู', 'ဇာပါဦး', 'Zar Pa Oo', 'sepInt'],
  ['0198770', 'มิว ลาย อู', 'မျိုးလှိုင်ဦး', 'Myo Hlaing Oo', 'open', null, 'R'],
  ['0240731', 'โซ เท', 'စိုးဌေး', 'Soe Htay', 'drive', null, '', 'new'],
  ['0178115', 'พิว พิว วิน', 'ဖြူဖြူဝင်း', 'Phyu Phyu Win', 'sepRed'],
  ['0180405', 'จู จู มิ', 'ကြူကြူမိ', 'Kyu Kyu Mi', 'washLarge', null, 'P'],
  ['0168244', 'คาย นี เวย์', 'ခိုင်နီဝေ', 'Khaing Ni Wai', 'sepSmall'],
  ['0198786', 'นอ ยี โซ', 'နော်ရီစိုး', 'Naw Yi Soe', 'turn', null, 'P'],
  ['0229456', 'ซาน วิน มาว', 'စန်းဝင်းမော်', 'San Win Maw', 'strip'],
  ['0167408', 'หน่าย ทุน', 'နိုင်ထွန်း', 'Naing Tun', 'cutHead'],
  ['0168273', 'เย มิน ดู', 'ရဲမင်းဒူး', 'Ye Min Du', 'drive', '05:30-15:00'],
  ['0219051', 'เม เย วิน เดย์', 'မေရဲဝင်းဒေး', 'May Ye Win Day', 'open'],
  ['0240735', 'โม ไน วิน', 'မိုးနိုင်ဝင်း', 'Moe Naing Win', 'pullFat'],
  ['0150620', 'โบ ชน', 'ဘိုချွန်', 'Bo Chun', 'pullFat'],
  ['0231914', 'มิน คาน จอ', 'မင်းခန့်ကျော်', 'Min Khant Kyaw', 'scrapeBody'],
  ['0219040', 'อู ทุน ลิน', 'ဦးထွန်းလင်း', 'U Tun Lin', 'putHead', null, 'P'],
  ['0241037', 'แทด อากา ซอ', 'သက်အာကာစိုး', 'Thet Arkar Soe', 'seal'],
  ['0150485', 'เมี๊ยะ ชู ชู หวย', 'မြချိုချိုဝေ', 'Mya Cho Cho Wai', 'scrapeHeadNeck'],
  ['0150593', 'เทียเรส ที', 'ထီရက်စ် သီ', 'Theres Thi', 'gall'],
  ['0214035', 'ชิน มา เงือน', 'ခင်မာငြိမ်း', 'Khin Mar Nyein', 'turn', null, 'P'],
  ['0178112', 'หัด หัด วี', 'ထက်ထက်ဝေ', 'Htet Htet Wai', 'weighFat'],
  ['0180406', 'มายีซานดา', 'မရီစန္ဒာ', 'Ma Yi Sandar', 'scrapeLegNeck', null, 'P'],
  ['0180401', 'เท เท อู', 'ဌေးဌေးဦး', 'Htay Htay Oo', 'washLarge', null, 'P'],
  ['0168243', 'มา มา เท', 'မမဌေး', 'Ma Ma Htay', 'strip'],
  ['0199053', 'ทู ซา เฮียน', 'သူဇာဟိန်း', 'Thu Zar Hein', 'washLarge'],
  ['0187782', 'จอ มิน ทุน', 'ကျော်မင်းထွန်း', 'Kyaw Min Tun', 'hang'],
  ['0233511', 'โซ โซ ยืน', 'စိုးစိုးယဉ်', 'Soe Soe Yin', 'turn'],
  ['0180404', 'ทุน', 'ထွန်း', 'Tun', 'scoopBoiled', null, 'P'],
  ['0239459', 'เอ ดานดาร์ อู', 'အေးသန္တာဦး', 'Aye Thandar Oo', 'strip'],
  ['0184425', 'วิน นาทุน', 'ဝင်းနထွန်း', 'Win Na Tun', 'scrapeLegNeck'],
  ['0229454', 'เพียว โก', 'ဖြိုးကို', 'Phyo Ko', 'boilInt', '06:30-15:30'],
  ['0108292', 'ปาริณา มาน้อย', 'ပါရိနာ မာနွိုင်', 'Parina Manoi', 'offalSet', '07:30-16:30'],
  ['0218005', 'เน มิน อ่อง', 'နေမင်းအောင်', 'Nay Min Aung', 'offalSet', '07:30-16:30'],
  ['0178122', 'เอ เมี๊ยะ ทู', 'အေးမြသူ', 'Aye Mya Thu', 'preg', '08:00-17:00'],
  ['0183038', 'เบญจวรรณ ยุดดร', 'ဘဉ်ဇဝမ် ယုဒ်ဒွန်', 'Benjawan Yuddon', 'preg', '08:00-17:00', '', 'leave'],
  ['0184419', 'เอ เทะ นาย', 'အေးသက်နိုင်', 'Aye Thet Naing', 'preg', '08:00-17:00'],
  ['0178124', 'ยะ มิน ทู', 'ရမင်းသူ', 'Ya Min Thu', 'preg', '08:00-17:00'],
  ['0214036', 'ดิน มา เท', 'ဒင်မာဌေး', 'Din Mar Htay', 'preg', '08:00-17:00', 'R'],
  ['0184420', 'มา ชิน มา โซ', 'မခင်မာစိုး', 'Ma Khin Mar Soe', 'preg', '08:00-17:00', 'P'],
  ['0232957', 'ดาน ชิน อ่อง', 'ဒန်ချင်းအောင်', 'Dan Chin Aung', 'drive', '', '', 'from2'],
  ['0241891', 'โซ โม อ่อง', 'စိုးမိုးအောင်', 'Soe Moe Aung', 'washLarge', '', '', 'from2'],
];

const S2 = [
  ['0077998', 'เครือวัลย์ พงษ์วิริช', 'ခရူဝမ် ဖုန်ဝိရစ်', 'Kruewan Phongwirit', 'lead', '17:00-02:00'],
  ['0092821', 'เสาวลักษณ์ ทอสา', 'ဆောင်ဝလက် ထော်ဆာ', 'Saowalak Thosa', 'lead', '19:00-04:00'],
  ['0184413', 'คัน อ่อง โม', 'ခန့်အောင်မိုး', 'Khant Aung Moe', 'recv', '14:00-23:00'],
  ['0187781', 'ตาล ไน', 'တန်နိုင်', 'Tan Naing', 'recv', '14:00-23:00'],
  ['0206882', 'ลิน ลิน', 'လင်းလင်း', 'Lin Lin', 'recv', '14:00-23:00'],
  ['0150612', 'เมียง โซ ไค', 'မြင့်စိုးခိုင်', 'Myint Soe Khaing', 'drive'],
  ['0237243', 'โก โก้', 'ကိုကို', 'Ko Ko', 'scrapeBody'],
  ['0182984', 'เสง ปราก', 'ဆင်းပရက်', 'Seng Prak', 'cutHead'],
  ['0219085', 'ไว โม ทวย', 'ဝေမိုးသွယ်', 'Wai Moe Thwe', 'pierce'],
  ['0199088', 'โพ โซ', 'ဖိုးစိုး', 'Pho Soe', 'pierce'],
  ['0238204', 'เย ดีฮา', 'ရဲဒီဟာ', 'Ye Diha', 'pullFat'],
  ['0182986', 'ทุล แก้ว', 'ထုလ် ကေ့ဝ်', 'Thul Kaew', 'cutHead'],
  ['0183891', 'เรือน ทอน', 'ရွမ် ထုန်', 'Ruean Thon', 'openWhite'],
  ['0234928', 'คิน ซัน มู', 'ခင်ဆန်းမူ', 'Khin San Mu', 'strip'],
  ['0184274', 'ทุน ซิน ละ', 'ထွန်းဇင်လှ', 'Tun Zin Hla', 'split'],
  ['0198789', 'กอง เทะ ลิน', 'ကောင်းထက်လင်း', 'Kaung Htet Lin', 'openWhite'],
  ['0178081', 'โจ เย อ่อง', 'ကျော်ရဲအောင်', 'Kyaw Ye Aung', 'split'],
  ['0217825', 'ฮัน โซ อ่อง', 'ဟန်စိုးအောင်', 'Han Soe Aung', 'pullFat'],
  ['0239455', 'จี ลิน ดุน', 'ကြည်လင်းထွန်း', 'Kyi Lin Tun', 'pullFat'],
  ['0239460', 'ไค ตา ซิน', 'ခိုင်တာဇင်', 'Khaing Tar Zin', 'weighWhite'],
  ['0183539', 'เด๊ะ นาดา จอ', 'ဒေးနန္ဒာကျော်', 'Day Nanda Kyaw', 'liftRed', null, 'P'],
  ['0199081', 'จา นิว', 'ဂျာညို', 'Ja Nyo', 'turn', null, 'R'],
  ['0206884', 'ดิน ทุน อู', 'ဒင်ထွန်းဦး', 'Din Tun Oo', 'openRed'],
  ['0228190', 'ชิด ชิด ซอ', 'ချစ်ချစ်စိုး', 'Chit Chit Soe', 'washStomach'],
  ['0207349', 'คิน ซัน วิน', 'ခင်ဆန်းဝင်း', 'Khin San Win', 'turn'],
  ['0150459', 'เอ๊ะ ตอ ชิน อู', 'အေးတော်ခင်ဦး', 'Aye Taw Khin Oo', 'washLarge'],
  ['0182987', 'ชาไม พุน', 'ချမိုင် ပွန်', 'Chamai Phun', 'tearLarge'],
  ['0199089', 'วิน โม ซอ', 'ဝင်းမိုးစော', 'Win Moe Saw', 'headCollect'],
  ['0228876', 'ดินนิลาลวิน', 'ဒင်နီလာလွင်', 'Din Nilar Lwin', 'strip'],
  ['0182983', 'ลิกา กอย', 'လီကာ ကွိုင်', 'Lika Koy', 'strip'],
  ['0207340', 'เย มิน เทะ', 'ရဲမင်းထက်', 'Ye Min Htet', 'scrapeNeck'],
  ['0178117', 'เอ เอ อ่อง', 'အေးအေးအောင်', 'Aye Aye Aung', 'turn'],
  ['0231915', 'เต็ง ตาน ไท่', 'တင့်သန်းထိုက်', 'Tint Than Htike', 'scrapeHead'],
  ['0236044', 'โซเอ มาร์ ลวิน', 'စိုးအေးမာလွင်', 'Soe Aye Mar Lwin', 'strip'],
  ['0236046', 'มอมอ ช่วยชิน', 'မိုးမိုးဆွေစင်', 'Moe Moe Swe Sin', 'turn'],
  ['0183538', 'เล ซา', 'လဲ့ဇာ', 'Lae Zar', 'gall', null, 'R'],
  ['0189706', 'กรวิภา ห่วงนาค', 'ကရဝိဘာ ဟွမ်နတ်', 'Korawipa Huangnak', 'washLarge'],
  ['0238881', 'มาว ซ้วน เอ็น ลิน', 'မောင်ဆွမ်အိန်လင်း', 'Maung Swan Ein Lin', 'liftRed'],
  ['0207347', 'อ่อง ซาน วิน', 'အောင်ဆန်းဝင်း', 'Aung San Win', 'weighWhiteSeal'],
  ['0238884', 'พิว พิว ไหล', 'ဖြူဖြူလှိုင်', 'Phyu Phyu Hlaing', 'strip'],
  ['0150619', 'สาย โพ โลน', 'စိုင်းဖိုးလုံ', 'Sai Pho Lone', 'weight'],
  ['0081852', 'ตุ๊กตา ชินวัฒนหงษ์', 'တုတ်တာ ချင်ဝတ်ထနဟုန်', 'Tukta Chinwatthanahong', 'strip', '18:00-03:00'],
  ['0135200', 'พัชรี ลอดสิมมา', 'ဖတ်ချရီ လော့ဆင်မာ', 'Phatcharee Lodsimma', 'packRed', '17:30-02:30'],
  ['0150450', 'มา ลา โซ', 'မလှစိုး', 'Ma Hla Soe', 'scald', '16:30-01:30'],
  ['0184276', 'เมา ซอ ทิน', 'မောင်စောတင်', 'Maung Saw Tin', 'boilBlood', '16:30-01:30'],
  ['0199058', 'เท เท โบ', 'ဌေးဌေးဘို', 'Htay Htay Bo', 'weighRed', '17:00-02:00'],
  ['0239456', 'โซ เต็ง', 'စိုးတင်', 'Soe Tin', 'scoop', '17:00-02:00'],
  ['0206895', 'ซอ เจ นัด เซ๊ะ', 'စောဂျေနတ်ဆေ', 'Saw Je Nat Se', 'liftRed', '17:00-02:00'],
  ['0180403', 'เมย์', 'မေ', 'May', 'washStomach', '', 'P', 'from1'],
  ['0168285', 'ซอ ลา แว ซี', 'စောလာဝေစီ', 'Saw Lar Wae Si', 'stick', '', '', 'from1'],
  ['0180407', 'เว เว ลวิน', 'ဝေဝေလွင်', 'Wai Wai Lwin', 'washLarge', '', 'R', 'from1'],
];

const mk = (shift, def) => (r) => ({
  id: r[0], th: r[1], mm: r[2], en: r[3], job: r[4],
  time: r[5] === undefined || r[5] === null ? def : r[5],
  bus: r[6] || '', note: r[7] || '', shift,
});

const RULES = {
  mm: 'ကိစ္စခွင့် – ၃ ရက်ကြို၍ အကြောင်းကြားရမည်\nခွင့်စာရေးရာတွင် ခေါင်းဆောင်၏ ခွင့်ပြုချက် ရယူရမည်\nအလုပ်ချိန်ကို ကိုယ်တိုင်ပြောင်းလဲခြင်း ခွင့်မပြုပါ',
  th: 'ลากิจ แจ้งล่วงหน้า 3 วัน\nการเขียนใบลา ต้องได้รับอนุญาตจากหัวหน้า\nเปลี่ยนเวลาทำงานเอง ไม่อนุมัติให้',
  en: 'Personal leave: notify 3 days in advance\nLeave forms must be approved by your supervisor\nChanging your own work hours is not allowed',
};

const initialData = () => ({
  workers: [...S1.map(mk(1, '06:00-15:00')), ...S2.map(mk(2, '16:00-01:00'))],
  date: '2026-11-04',
  shiftPhone: '096-2197449',
  linePhone: '092-0011437',
  rules: { ...RULES },
  pin: '1234',
});

/* ===================== HELPERS ===================== */
const MMD = '၀၁၂၃၄၅၆၇၈၉';
const MON = {
  mm: ['ဇန်နဝါရီ', 'ဖေဖော်ဝါရီ', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်', 'ဇူလိုင်', 'ဩဂုတ်', 'စက်တင်ဘာ', 'အောက်တိုဘာ', 'နိုဝင်ဘာ', 'ဒီဇင်ဘာ'],
  th: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};
const toMM = (s) => String(s).replace(/\d/g, (d) => MMD[d]);
const fmtDate = (iso, l) => {
  const p = (iso || '').split('-').map(Number);
  if (p.length !== 3 || !p[0]) return iso;
  const [y, m, d] = p;
  if (l === 'mm') return `${toMM(d)} ${MON.mm[m - 1]} ${toMM(y)}`;
  if (l === 'th') return `${d} ${MON.th[m - 1]} ${y + 543}`;
  return `${d} ${MON.en[m - 1]} ${y}`;
};
const nameOf = (w, l) => w[l] || w.en || w.th || w.mm || '-';
const subName = (w, l) => (l === 'th' ? w.en : w.th);
const noteColor = (n) => (n === 'new' ? C.green : n === 'leave' ? C.pink : C.cyan);

/* ===================== SMALL COMPONENTS ===================== */
const Chip = ({ label, active, onPress, color = C.amber, icon }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[st.chip, active && { backgroundColor: color, borderColor: color }]}
  >
    {icon ? <Ionicons name={icon} size={13} color={active ? '#0A0A12' : C.muted} style={{ marginRight: 4 }} /> : null}
    <Text style={[st.chipTx, active && { color: '#0A0A12', fontWeight: '800' }]}>{label}</Text>
  </TouchableOpacity>
);

const Tag = ({ text, color }) => (
  <View style={[st.tag, { borderColor: color + '66', backgroundColor: color + '1F' }]}>
    <Text style={[st.tagTx, { color }]}>{text}</Text>
  </View>
);

const Field = ({ label, ...p }) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={st.fLbl}>{label}</Text>
    <TextInput placeholderTextColor={C.muted} style={[st.input, p.multiline && { minHeight: 80, textAlignVertical: 'top' }]} {...p} />
  </View>
);

/* ===================== APP ===================== */
export default function App() {
  const [lang, setLang] = useState('mm');
  const [data, setData] = useState(null);
  const [shift, setShift] = useState(1);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [group, setGroup] = useState(false);
  const [detail, setDetail] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [pinIn, setPinIn] = useState('');
  const [form, setForm] = useState(null);
  const [setOpen, setSetOpen] = useState(false);
  const [setForm2, setSetForm2] = useState(null);
  const [noticeOpen, setNoticeOpen] = useState(false);

  const t = T[lang];
  const accent = shift === 1 ? C.amber : C.violet;
  const num = (n) => (lang === 'mm' ? toMM(n) : String(n));

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        const l = await AsyncStorage.getItem(KEY + '_lang');
        if (l) setLang(l);
        setData(raw ? JSON.parse(raw) : initialData());
      } catch (e) {
        setData(initialData());
      }
    })();
  }, []);

  const save = (nd) => {
    setData(nd);
    AsyncStorage.setItem(KEY, JSON.stringify(nd)).catch(() => {});
  };
  const changeLang = (l) => {
    setLang(l);
    AsyncStorage.setItem(KEY + '_lang', l).catch(() => {});
  };

  const shiftWorkers = useMemo(() => (data ? data.workers.filter((w) => w.shift === shift) : []), [data, shift]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return shiftWorkers
      .filter((w) => {
        if (filter === 'R') return w.bus === 'R';
        if (filter === 'P') return w.bus === 'P';
        if (filter === 'moved') return w.note === 'from1' || w.note === 'from2';
        if (filter === 'preg') return w.job === 'preg';
        if (filter === 'lead') return w.job === 'lead';
        return true;
      })
      .filter((w) => !s || [w.id, w.th, w.mm, w.en].some((x) => (x || '').toLowerCase().includes(s)));
  }, [shiftWorkers, q, filter]);

  const sections = useMemo(() => {
    if (!group) return [{ key: 'all', title: null, data: list }];
    const map = {};
    const order = [];
    list.forEach((w) => {
      if (!map[w.job]) { map[w.job] = []; order.push(w.job); }
      map[w.job].push(w);
    });
    return order.map((k) => ({ key: k, title: jobName(k, lang), data: map[k] }));
  }, [list, group, lang]);

  const count = (fn) => shiftWorkers.filter(fn).length;
  const c1 = data ? data.workers.filter((w) => w.shift === 1).length : 0;
  const c2 = data ? data.workers.filter((w) => w.shift === 2).length : 0;

  /* ---------- admin actions ---------- */
  const tryLogin = () => {
    if (pinIn === data.pin) {
      setAdmin(true); setPinOpen(false); setPinIn('');
    } else Alert.alert(t.pinWrong);
  };

  const openEdit = (w) => {
    setDetail(null);
    setForm(w ? { ...w, _orig: w.id } : {
      id: '', th: '', mm: '', en: '', job: 'drive',
      time: shift === 1 ? '06:00-15:00' : '16:00-01:00', bus: '', note: 'new', shift, _orig: null,
    });
  };

  const saveForm = () => {
    const f = form;
    if (!f.id.trim() || !(f.th.trim() || f.mm.trim() || f.en.trim())) return Alert.alert(t.required);
    const clash = data.workers.find((w) => w.id === f.id.trim() && w.id !== f._orig);
    if (clash) return Alert.alert(t.idExists);
    const clean = { id: f.id.trim(), th: f.th.trim(), mm: f.mm.trim(), en: f.en.trim(), job: f.job, time: f.time.trim(), bus: f.bus, note: f.note, shift: f.shift };
    const workers = f._orig
      ? data.workers.map((w) => (w.id === f._orig ? clean : w))
      : [...data.workers, clean];
    save({ ...data, workers });
    setForm(null);
  };

  const delWorker = (w) => {
    Alert.alert(t.del, `${nameOf(w, lang)}\n${t.delQ}`, [
      { text: t.cancel, style: 'cancel' },
      { text: t.del, style: 'destructive', onPress: () => { save({ ...data, workers: data.workers.filter((x) => x.id !== w.id) }); setDetail(null); } },
    ]);
  };

  const moveWorker = (w) => {
    const to = w.shift === 1 ? 2 : 1;
    const nw = { ...w, shift: to, note: w.shift === 1 ? 'from1' : 'from2' };
    save({ ...data, workers: data.workers.map((x) => (x.id === w.id ? nw : x)) });
    setDetail(null);
  };

  const openSettings = () => {
    setSetForm2({ date: data.date, shiftPhone: data.shiftPhone, linePhone: data.linePhone, rules: { ...data.rules }, pin: '' });
    setSetOpen(true);
  };
  const saveSettings = () => {
    const s = setForm2;
    save({ ...data, date: s.date.trim(), shiftPhone: s.shiftPhone.trim(), linePhone: s.linePhone.trim(), rules: s.rules, pin: s.pin.trim() ? s.pin.trim() : data.pin });
    setSetOpen(false);
    Alert.alert(t.saved);
  };
  const resetAll = () => {
    Alert.alert(t.reset, t.resetQ, [
      { text: t.cancel, style: 'cancel' },
      { text: t.yes, style: 'destructive', onPress: () => { save({ ...initialData(), pin: data.pin }); setSetOpen(false); } },
    ]);
  };

  const call = (p) => Linking.openURL('tel:' + p.replace(/[^0-9+]/g, '')).catch(() => {});

  if (!data) {
    return (
      <View style={[st.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <Ionicons name="people" size={48} color={C.amber} />
      </View>
    );
  }

  const noteLabel = (n) => (n ? t[n] : '');
  const busLabel = (b) => (b === 'R' ? t.busR : b === 'P' ? t.busP : t.noBus);

  /* ---------- row ---------- */
  const renderItem = ({ item: w, index }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={() => setDetail(w)} style={st.row}>
      <View style={[st.rowBar, { backgroundColor: w.job === 'lead' ? C.pink : accent }]} />
      <View style={[st.avatar, { borderColor: accent }]}>
        <Text style={[st.avatarTx, { color: accent }]}>{num(index + 1)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
          <Text style={st.name} numberOfLines={1}>{nameOf(w, lang)}</Text>
          {w.job === 'lead' && <Ionicons name="star" size={13} color={C.pink} style={{ marginLeft: 6 }} />}
        </View>
        <Text style={st.subName} numberOfLines={1}>{subName(w, lang)} • {w.id}</Text>
        <View style={st.rowTags}>
          <Tag text={jobName(w.job, lang)} color={accent} />
          {w.bus ? <Tag text={busLabel(w.bus)} color={w.bus === 'R' ? C.green : C.cyan} /> : null}
          {w.note ? <Tag text={noteLabel(w.note)} color={noteColor(w.note)} /> : null}
        </View>
      </View>
      <View style={st.timeBox}>
        <Ionicons name="time-outline" size={13} color={C.muted} />
        <Text style={st.timeTx}>{w.time ? w.time.split('-')[0] : '—'}</Text>
        <Text style={st.timeTx2}>{w.time ? w.time.split('-')[1] : ''}</Text>
        {admin && (
          <TouchableOpacity onPress={() => openEdit(w)} style={st.miniEdit}>
            <Ionicons name="create-outline" size={16} color={C.amber} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  /* ---------- header ---------- */
  const Header = (
    <View>
      {/* top bar */}
      <View style={st.top}>
        <View style={{ flex: 1 }}>
          <Text style={st.title}>{t.title}</Text>
          <Text style={st.sub} numberOfLines={1}>{t.sub}</Text>
        </View>
        <TouchableOpacity onPress={() => (admin ? openSettings() : setPinOpen(true))} style={[st.iconBtn, admin && { borderColor: C.amber }]}>
          <Ionicons name={admin ? 'settings' : 'shield-checkmark-outline'} size={20} color={admin ? C.amber : C.text} />
        </TouchableOpacity>
      </View>

      {/* language switch */}
      <View style={st.langRow}>
        {[['mm', 'မြန်မာ'], ['th', 'ไทย'], ['en', 'EN']].map(([k, l]) => (
          <TouchableOpacity key={k} onPress={() => changeLang(k)} style={[st.langBtn, lang === k && st.langOn]}>
            <Text style={[st.langTx, lang === k && { color: '#0A0A12' }]}>{l}</Text>
          </TouchableOpacity>
        ))}
        <View style={st.dateChip}>
          <Ionicons name="calendar-outline" size={14} color={C.text} />
          <Text style={st.dateTx}>{fmtDate(data.date, lang)}</Text>
        </View>
      </View>

      {admin && (
        <View style={st.adminBar}>
          <Ionicons name="flash" size={14} color="#0A0A12" />
          <Text style={st.adminBarTx}>{t.adminMode}</Text>
        </View>
      )}

      {/* shift cards */}
      <View style={st.shiftRow}>
        {[1, 2].map((s) => {
          const on = shift === s;
          const col = s === 1 ? C.amber : C.violet;
          return (
            <TouchableOpacity key={s} activeOpacity={0.85} onPress={() => { setShift(s); setFilter('all'); }}
              style={[st.shiftCard, on && { backgroundColor: col, borderColor: col }]}>
              <View style={st.shiftHead}>
                <Ionicons name={s === 1 ? 'sunny' : 'moon'} size={22} color={on ? '#0A0A12' : col} />
                <Text style={[st.shiftBig, { color: on ? '#0A0A12' : C.text }]}>{num(s === 1 ? c1 : c2)}</Text>
              </View>
              <Text style={[st.shiftName, { color: on ? '#0A0A12' : C.text }]}>{s === 1 ? t.s1 : t.s2}</Text>
              <Text style={[st.shiftSub, { color: on ? '#0A0A12AA' : C.muted }]}>{s === 1 ? t.day : t.night} • {s === 1 ? 'กะ 1' : 'กะ 2'}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* stats */}
      <View style={st.stats}>
        {[
          ['people', count(() => true), t.total, accent],
          ['bus', count((w) => w.bus === 'R'), t.busR, C.green],
          ['boat', count((w) => w.bus === 'P'), t.busP, C.cyan],
          ['swap-horizontal', count((w) => w.note === 'from1' || w.note === 'from2'), t.moved, C.pink],
        ].map(([ic, n, l, col]) => (
          <View key={l} style={st.stat}>
            <Ionicons name={ic} size={16} color={col} />
            <Text style={[st.statN, { color: col }]}>{num(n)}</Text>
            <Text style={st.statL} numberOfLines={2}>{l}</Text>
          </View>
        ))}
      </View>

      {/* notice */}
      <TouchableOpacity onPress={() => setNoticeOpen(!noticeOpen)} style={st.notice}>
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
                <Text style={st.callN}>{data.shiftPhone}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => call(data.linePhone)} style={[st.callBtn, { backgroundColor: C.violet }]}>
              <Ionicons name="call" size={16} color="#0A0A12" />
              <View style={{ marginLeft: 6, flex: 1 }}>
                <Text style={st.callL} numberOfLines={1}>{t.callLine}</Text>
                <Text style={st.callN}>{data.linePhone}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* search */}
      <View style={st.searchBox}>
        <Ionicons name="search" size={18} color={C.muted} />
        <TextInput value={q} onChangeText={setQ} placeholder={t.search} placeholderTextColor={C.muted} style={st.searchIn} />
        {q ? (
          <TouchableOpacity onPress={() => setQ('')}><Ionicons name="close-circle" size={18} color={C.muted} /></TouchableOpacity>
        ) : null}
      </View>

      {/* filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }} contentContainerStyle={{ paddingHorizontal: 16 }}>
        <Chip label={group ? t.groupJob : t.list} icon={group ? 'layers' : 'list'} active color={C.pink} onPress={() => setGroup(!group)} />
        <Chip label={t.all} active={filter === 'all'} color={accent} onPress={() => setFilter('all')} />
        <Chip label={t.lead} icon="star" active={filter === 'lead'} color={accent} onPress={() => setFilter('lead')} />
        <Chip label={t.busR} icon="bus" active={filter === 'R'} color={accent} onPress={() => setFilter('R')} />
        <Chip label={t.busP} icon="boat" active={filter === 'P'} color={accent} onPress={() => setFilter('P')} />
        <Chip label={t.moved} icon="swap-horizontal" active={filter === 'moved'} color={accent} onPress={() => setFilter('moved')} />
        <Chip label={t.preg} icon="heart" active={filter === 'preg'} color={accent} onPress={() => setFilter('preg')} />
      </ScrollView>
      <Text style={st.hint}>{num(list.length)} {t.ppl} • {t.tapHint}</Text>
    </View>
  );

  /* ===================== RENDER ===================== */
  return (
    <SafeAreaView style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <SectionList
        sections={sections}
        keyExtractor={(w) => w.id}
        renderItem={renderItem}
        ListHeaderComponent={Header}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) =>
          section.title ? (
            <View style={st.secHead}>
              <View style={[st.secDot, { backgroundColor: accent }]} />
              <Text style={st.secTx}>{section.title}</Text>
              <Text style={[st.secN, { color: accent }]}>{num(section.data.length)}</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Ionicons name="search-outline" size={40} color={C.muted} />
            <Text style={{ color: C.muted, marginTop: 8 }}>{t.empty}</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 110, paddingTop: Platform.OS === 'android' ? 28 : 0 }}
        keyboardShouldPersistTaps="handled"
      />

      {admin && (
        <TouchableOpacity style={[st.fab, { backgroundColor: accent }]} onPress={() => openEdit(null)}>
          <Ionicons name="person-add" size={24} color="#0A0A12" />
        </TouchableOpacity>
      )}

      {/* ---------- DETAIL ---------- */}
      <Modal visible={!!detail} transparent animationType="slide" onRequestClose={() => setDetail(null)}>
        <View style={st.overlay}>
          {detail && (
            <View style={st.sheet}>
              <View style={st.grab} />
              <View style={[st.bigAvatar, { borderColor: detail.shift === 1 ? C.amber : C.violet }]}>
                <Ionicons name={detail.job === 'lead' ? 'star' : 'person'} size={34} color={detail.shift === 1 ? C.amber : C.violet} />
              </View>
              <Text style={st.dName}>{nameOf(detail, lang)}</Text>
              <Text style={st.dId}>ID {detail.id}</Text>
              <ScrollView style={{ maxHeight: 380 }}>
                <Text style={st.dSec}>{t.names}</Text>
                <View style={st.dBox}>
                  <Text style={st.dLine}><Text style={st.dK}>MM  </Text>{detail.mm || '—'}</Text>
                  <Text style={st.dLine}><Text style={st.dK}>TH  </Text>{detail.th || '—'}</Text>
                  <Text style={st.dLine}><Text style={st.dK}>EN  </Text>{detail.en || '—'}</Text>
                </View>
                <Text style={st.dSec}>{t.jobAll}</Text>
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
              </ScrollView>
              {admin && (
                <View style={{ flexDirection: 'row', marginTop: 12 }}>
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
              <TouchableOpacity style={st.closeBtn} onPress={() => setDetail(null)}>
                <Ionicons name="close" size={22} color={C.text} />
              </TouchableOpacity>
            </View>
          )}
        </View>
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
              <TouchableOpacity style={[st.aBtn, { backgroundColor: C.amber }]} onPress={tryLogin}>
                <Text style={st.aTx}>{t.enter}</Text>
              </TouchableOpacity>
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
                    <Chip key={n || 'none'} label={n ? t[n] : t.none} active={form.note === n} color={C.pink} onPress={() => setForm({ ...form, note: n })} />
                  ))}
                </View>

                <Text style={st.fLbl}>{t.job}</Text>
                <View style={st.wrap}>
                  {Object.keys(JOBS).map((k) => (
                    <Chip key={k} label={jobName(k, lang)} active={form.job === k} color={C.amber} onPress={() => setForm({ ...form, job: k })} />
                  ))}
                </View>

                <TouchableOpacity onPress={saveForm} style={[st.bigBtn, { backgroundColor: C.amber }]}>
                  <Ionicons name="save" size={18} color="#0A0A12" />
                  <Text style={st.bigBtnTx}>{t.save}</Text>
                </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        )}
      </Modal>

      {/* ---------- SETTINGS ---------- */}
      <Modal visible={setOpen} animationType="slide" onRequestClose={() => setSetOpen(false)}>
        {setForm2 && (
          <SafeAreaView style={st.root}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
              <View style={[st.top, { paddingTop: Platform.OS === 'android' ? 36 : 8 }]}>
                <TouchableOpacity onPress={() => setSetOpen(false)} style={st.iconBtn}><Ionicons name="close" size={20} color={C.text} /></TouchableOpacity>
                <Text style={[st.title, { flex: 1, marginLeft: 12, fontSize: 20 }]}>{t.settings}</Text>
                <TouchableOpacity onPress={saveSettings} style={[st.iconBtn, { backgroundColor: C.amber, borderColor: C.amber }]}><Ionicons name="checkmark" size={20} color="#0A0A12" /></TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
                <Field label={t.dateFmt} value={setForm2.date} onChangeText={(v) => setSetForm2({ ...setForm2, date: v })} placeholder="2026-11-04" />
                <Field label={t.shiftSup} value={setForm2.shiftPhone} onChangeText={(v) => setSetForm2({ ...setForm2, shiftPhone: v })} keyboardType="phone-pad" />
                <Field label={t.lineSup} value={setForm2.linePhone} onChangeText={(v) => setSetForm2({ ...setForm2, linePhone: v })} keyboardType="phone-pad" />
                {['mm', 'th', 'en'].map((l) => (
                  <Field key={l} label={`${t.rulesLbl} (${l.toUpperCase()})`} multiline value={setForm2.rules[l]}
                    onChangeText={(v) => setSetForm2({ ...setForm2, rules: { ...setForm2.rules, [l]: v } })} />
                ))}
                <Field label={t.newPin} value={setForm2.pin} onChangeText={(v) => setSetForm2({ ...setForm2, pin: v })} keyboardType="number-pad" secureTextEntry maxLength={8} />

                <TouchableOpacity onPress={saveSettings} style={[st.bigBtn, { backgroundColor: C.amber }]}>
                  <Ionicons name="save" size={18} color="#0A0A12" /><Text style={st.bigBtnTx}>{t.save}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={resetAll} style={[st.bigBtn, { backgroundColor: C.card2, borderWidth: 1, borderColor: C.red }]}>
                  <Ionicons name="refresh" size={18} color={C.red} /><Text style={[st.bigBtnTx, { color: C.red }]}>{t.reset}</Text>
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
  dateChip: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', backgroundColor: C.card2, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20 },
  dateTx: { color: C.text, fontSize: 12, marginLeft: 5, fontWeight: '600', lineHeight: 20 },

  adminBar: { marginHorizontal: 16, marginBottom: 10, backgroundColor: C.amber, borderRadius: 10, paddingVertical: 5, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  adminBarTx: { color: '#0A0A12', fontWeight: '900', marginLeft: 6, letterSpacing: 2, fontSize: 12, lineHeight: 20 },

  shiftRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12 },
  shiftCard: { flex: 1, backgroundColor: C.card, borderRadius: 22, padding: 14, borderWidth: 1.5, borderColor: C.line, marginHorizontal: 4 },
  shiftHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shiftBig: { fontSize: 30, fontWeight: '900' },
  shiftName: { fontSize: 18, fontWeight: '900', marginTop: 6, lineHeight: 28 },
  shiftSub: { fontSize: 11, lineHeight: 18 },

  stats: { flexDirection: 'row', marginHorizontal: 16, backgroundColor: C.card, borderRadius: 18, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: C.line },
  stat: { flex: 1, alignItems: 'center' },
  statN: { fontSize: 20, fontWeight: '900', marginTop: 2 },
  statL: { color: C.muted, fontSize: 10, textAlign: 'center', lineHeight: 16 },

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
  hint: { color: C.muted, fontSize: 11, marginHorizontal: 16, marginBottom: 8, lineHeight: 18 },

  secHead: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 14, marginBottom: 6 },
  secDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  secTx: { color: C.text, fontWeight: '800', flex: 1, lineHeight: 24 },
  secN: { fontWeight: '900' },

  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, marginHorizontal: 16, marginBottom: 8, borderRadius: 18, padding: 12, paddingLeft: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.line },
  rowBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  avatar: { width: 40, height: 40, borderRadius: 13, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: C.card2 },
  avatarTx: { fontWeight: '900', fontSize: 14 },
  name: { color: C.text, fontSize: 16, fontWeight: '800', lineHeight: 26, flexShrink: 1 },
  subName: { color: C.muted, fontSize: 11, lineHeight: 18 },
  rowTags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  tag: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, marginRight: 4, marginTop: 3 },
  tagTx: { fontSize: 11, fontWeight: '700', lineHeight: 18 },
  timeBox: { alignItems: 'center', marginLeft: 8, minWidth: 48 },
  timeTx: { color: C.text, fontWeight: '800', fontSize: 13, marginTop: 2 },
  timeTx2: { color: C.muted, fontSize: 11 },
  miniEdit: { marginTop: 6, padding: 4, borderRadius: 8, backgroundColor: C.card2 },

  fab: { position: 'absolute', right: 20, bottom: 30, width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 8 },

  overlay: { flex: 1, backgroundColor: '#000000AA', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 30, borderWidth: 1, borderColor: C.line },
  grab: { width: 44, height: 5, borderRadius: 3, backgroundColor: C.line, alignSelf: 'center', marginBottom: 14 },
  bigAvatar: { width: 70, height: 70, borderRadius: 24, borderWidth: 2, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', backgroundColor: C.card2 },
  dName: { color: C.text, fontSize: 22, fontWeight: '900', textAlign: 'center', marginTop: 10, lineHeight: 34 },
  dId: { color: C.muted, textAlign: 'center', marginBottom: 8 },
  dSec: { color: C.amber, fontWeight: '800', fontSize: 12, marginTop: 10, marginBottom: 4, lineHeight: 20 },
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

  pinCard: { backgroundColor: C.card, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: C.line },
  pinT: { color: C.text, fontSize: 18, fontWeight: '900', textAlign: 'center', marginVertical: 10, lineHeight: 28 },
  pinIn: { backgroundColor: C.card2, color: C.text, fontSize: 24, textAlign: 'center', letterSpacing: 10, borderRadius: 14, paddingVertical: 12, marginBottom: 8 },

  fLbl: { color: C.muted, fontSize: 12, marginBottom: 6, fontWeight: '700', lineHeight: 20 },
  input: { backgroundColor: C.card, color: C.text, borderRadius: 14, borderWidth: 1, borderColor: C.line, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  bigBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, paddingVertical: 14, marginTop: 10 },
  bigBtnTx: { color: '#0A0A12', fontWeight: '900', marginLeft: 8, fontSize: 15, lineHeight: 22 },
});
