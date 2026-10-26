export interface MuscleCard {
  id: number;
  cat: 'eh' | 'kude' | 'kuju' | 'nimi' | 'fn' | 'fys';
  q: string;
  a: string;
  latin?: string;
  shortAnswer?: string;
  explanation?: string;
}

export interface CategoryInfo {
  id: 'eh' | 'kude' | 'kuju' | 'nimi' | 'fn' | 'fys';
  name: string;
  shortName: string;
  icon: string;
  color: string;
  bgLight: string;
  description: string;
}

export const CATEGORIES: Record<string, CategoryInfo> = {
  eh: {
    id: 'eh',
    name: 'Ehitus ja terminid',
    shortName: 'Ehitus',
    icon: 'Layers',
    color: 'rgb(225, 29, 72)', // rose-600
    bgLight: 'rgba(225, 29, 72, 0.12)',
    description: 'Lihase kestad, kõõlused, kinnituskohad ja anatoomilised mõisted'
  },
  kude: {
    id: 'kude',
    name: 'Lihaskoe tüübid',
    shortName: 'Koe tüübid',
    icon: 'Activity',
    color: 'rgb(234, 88, 12)', // orange-600
    bgLight: 'rgba(234, 88, 12, 0.12)',
    description: 'Skeletilihased, südamelihas, silelihased ja tahtele alluvus'
  },
  kuju: {
    id: 'kuju',
    name: 'Kuju ja liigesed',
    shortName: 'Kujud',
    icon: 'Shapes',
    color: 'rgb(147, 51, 234)', // purple-600
    bgLight: 'rgba(147, 51, 234, 0.12)',
    description: 'Biceps, triceps, liigeste ületamine ja sulgjad lihased'
  },
  nimi: {
    id: 'nimi',
    name: 'Ladina nimetuste tähendus',
    shortName: 'Ladina keel',
    icon: 'BookOpen',
    color: 'rgb(2, 132, 199)', // sky-600
    bgLight: 'rgba(2, 132, 199, 0.12)',
    description: 'Ladina eesliited, suunad, suurused ja anatoomiline nomenklatuur'
  },
  fn: {
    id: 'fn',
    name: 'Funktsioonid ja liigutused',
    shortName: 'Funktsioonid',
    icon: 'Zap',
    color: 'rgb(13, 148, 136)', // teal-600
    bgLight: 'rgba(13, 148, 136, 0.12)',
    description: 'Abductor, flexor, sirutajad ja spetsiifilised liigutajad'
  },
  fys: {
    id: 'fys',
    name: 'Füsioloogia ja biokeemia',
    shortName: 'Füsioloogia',
    icon: 'Flame',
    color: 'rgb(217, 119, 6)', // amber-600
    bgLight: 'rgba(217, 119, 6, 0.12)',
    description: 'Sarkomeer, aktiin, müosiin, kontraktsioonitüübid ja ATP'
  }
};

export const RAW_CARDS: [MuscleCard['cat'], string, string, string?][] = [
  // 1. Ehitus ja terminid (eh)
  ["eh", "Mis on lihase ladinakeelne nimetus?", "Musculus", "musculus"],
  ["eh", "Mis on kõõluse ladinakeelne nimetus?", "Tendo", "tendo"],
  ["eh", "Kuidas nimetatakse kogu lihast ümbritsevat sidekoelist kesta?", "Epimüüsium (epimysium)", "epimysium"],
  ["eh", "Kuidas nimetatakse lihaskiudude kimpe ümbritsevat sidekoelist kesta?", "Perimüüsium (perimysium)", "perimysium"],
  ["eh", "Kuidas nimetatakse iga individuaalset lihaskiudu ümbritsevat sidekoelist kesta?", "Endomüüsium (endomysium)", "endomysium"],
  ["eh", "Kuidas nimetatakse laiade lihaste õhukest ja lamedat kilejat kõõlust?", "Aponeuroos ehk kilekõõlus (aponeurosis)", "aponeuroos"],
  ["eh", "Kuidas nimetatakse teadusharu, mis uurib lihaseid?", "Müoloogia", "myologia"],
  ["eh", "Kuidas nimetatakse lihase paigalpüsivat või väheliikuvat algusosa?", "Lihase alguskoht (origo)", "origo"],
  ["eh", "Kuidas nimetatakse lihase liikuvamat vastasotsa kokkutõmbumisel?", "Lihase kinnituskoht (insertio)", "insertio"],
  ["eh", "Kuidas nimetatakse pika lihase keskset paksenenud osa?", "Lihasekõht", "lihasekõht"],

  // 2. Lihaskoe tüübid (kude)
  ["kude", "Mitu skeletilihast on ligikaudu inimese kehas?", "Umbes 400 kuni 600 skeletilihast.", "400-600"],
  ["kude", "Mis on skeletilihaste ehk vöötlihaste peamine juhtimisomadus?", "Skeletilihased alluvad inimese tahtele.", "alluvad tahtele"],
  ["kude", "Kuidas nimetatakse südame põhimassi moodustavat lihaskude?", "Südamelihas (myocardium)", "myocardium"],
  ["kude", "Millist tüüpi lihaskude moodustab siseelundite ja veresoonte seinu?", "Silelihaskude", "silelihas"],

  // 3. Kuju ja liigesed (kuju)
  ["kuju", "Mis on kahelise alguspeaga lihase ladinakeelne nimetus?", "Musculus biceps", "biceps"],
  ["kuju", "Mis on kolmelise alguspeaga lihase ladinakeelne nimetus?", "Musculus triceps", "triceps"],
  ["kuju", "Mis on neljalise alguspeaga lihase ladinakeelne nimetus?", "Musculus quadriceps", "quadriceps"],
  ["kuju", "Mis on kakskõhtlihas?", "Lihas, mille lihasekõht on vahekõõluse abil jagatud kaheks osaks.", "kakskõhtlihas"],
  ["kuju", "Millist lihast nimetatakse ainuliigeseliseks lihaseks?", "Lihast, mis kulgeb üle ühe liigese.", "ainuliigeseline"],
  ["kuju", "Millist lihast nimetatakse kaheliigeseliseks lihaseks?", "Lihast, mis kulgeb üle kahe liigese.", "kaheliigeseline"],
  ["kuju", "Millist lihast nimetatakse mitmeliigeseliseks lihaseks?", "Lihast, mis kulgeb üle rohkem kui kahe liigese.", "mitmeliigeseline"],
  ["kuju", "Mis iseloomustab ühelisulgjat lihast?", "Lihaskiud kinnituvad kõõlusele põiki ainult ühelt poolt.", "ühelisulgjas"],
  ["kuju", "Mis iseloomustab kahelisulgjat lihast?", "Lihaskiud kinnituvad kõõlusele mõlemalt poolt teravnurga all.", "kahelisulgjas"],
  ["kuju", "Mis on inimese keha pikim lihas?", "Rätsepalihas (musculus sartorius)", "sartorius"],

  // 4. Ladina nimetuste tähendus (nimi)
  ["nimi", "Mida tähistab lihase nimetuses ladinakeelne sõna vastus?", "Hiiglaslikku või väga suurt mõõdet.", "hiiglaslik"],
  ["nimi", "Mida tähistab lihase nimetuses ladinakeelne sõna maximus?", "Suurimat mõõdet.", "suurim"],
  ["nimi", "Mida tähistab lihase nimetuses ladinakeelne sõna minimus?", "Väikseimat mõõdet.", "väikseim"],
  ["nimi", "Mida tähistab lihase nimetuses ladinakeelne sõna longus?", "Pikka mõõdet.", "pikk"],
  ["nimi", "Mida tähistab lihase nimetuses ladinakeelne sõna brevis?", "Lühikest mõõdet.", "lühike"],
  ["nimi", "Mida tähistab lihase nimetuses ladinakeelne sõna deltoideus?", "Kolmnurkset kuju.", "kolmnurkne"],
  ["nimi", "Mida tähistab lihase nimetuses ladinakeelne sõna latissimus?", "Laiimat kuju.", "laieim"],
  ["nimi", "Mida tähistab lihase nimetuses ladinakeelne sõna trapezius?", "Trapetsikujulist kuju.", "trapetsikujuline"],
  ["nimi", "Mida tähistab lihase nimetuses ladinakeelne sõna rectus?", "Otse ehk sirgelt kulgevaid lihaskiude.", "sirge"],
  ["nimi", "Mida tähistab lihase nimetuses ladinakeelne sõna transversus?", "Risti kulgevaid lihaskiude.", "risti"],
  ["nimi", "Mida tähistab lihase nimetuses ladinakeelne sõna obliquus?", "Diagonaalselt ehk põiki kulgevaid lihaskiude.", "põiki"],
  ["nimi", "Mida tähistab lihase nimetuses ladinakeelne sõna orbicularis?", "Ringikujulist ehk sõõrjat asendit.", "sõõrjas"],
  ["nimi", "Mida tähistab lihase nimetuses ladinakeelne sõna pectoralis?", "Rinna piirkonnas paiknemist.", "rind"],
  ["nimi", "Mida tähistab lihase nimetuses ladinakeelne sõna gluteus?", "Tuhara piirkonnas paiknemist.", "tuhar"],
  ["nimi", "Mida tähistab lihase nimetuses ladinakeelne sõna brachii?", "Õlavarre piirkonnas paiknemist.", "õlavars"],
  ["nimi", "Mida tähistab eesliide supra- lihase nimetuses?", "Asukohta teise struktuuri kohal ehk ülal.", "ülal"],
  ["nimi", "Mida tähistab eesliide infra- lihase nimetuses?", "Asukohta teise struktuuri all.", "all"],
  ["nimi", "Mida tähistab eesliide sub- lihase nimetuses?", "Asukohta teise struktuuri all või sees.", "all või sees"],

  // 5. Funktsioonid (fn)
  ["fn", "Millist funktsiooni täidab abductor-lihas?", "Eemaldab kehaosa keskjoonest.", "eemaldaja"],
  ["fn", "Millist funktsiooni täidab adductor-lihas?", "Lähendab kehaosa keskjoonele.", "lähendaja"],
  ["fn", "Millist funktsiooni täidab flexor-lihas?", "Painutab liigest ehk vähendab liigesenurka.", "painutaja"],
  ["fn", "Millist funktsiooni täidab extensor-lihas?", "Sirutab liigest ehk suurendab liigesenurka.", "sirutaja"],
  ["fn", "Millist funktsiooni täidab levator-lihas?", "Tõstab kehaosa või struktuuri ülespoole.", "tõstja"],
  ["fn", "Mis on masseter-lihase peamine funktsioon?", "Mälumisliigutuste sooritamine.", "mälurlihas"],
  ["fn", "Mis on rinnakult ja rangluult algava ning nibujätkele kinnituva lihase ladinakeelne nimetus?", "Musculus sternocleidomastoideus", "sternocleidomastoideus"],

  // 6. Füsioloogia (fys)
  ["fys", "Milline on punaste ehk aeglaste lihaskiudude peamine energia tootmise viis?", "Aeroobne oksüdatsioon ehk hapnikuga energia tootmine.", "aeroobne"],
  ["fys", "Milline valk talletab punastes lihaskiududes hapnikku pikaajaliseks kontraktsiooniks?", "Müoglobiin", "müoglobiin"],
  ["fys", "Milline on valgete ehk kiirete lihaskiudude peamine ATP tootmise viis?", "Glükolüüs (anaeroobne rada)", "glükolüüs"],
  ["fys", "Mis on valgete lihaskiudude peamine funktsionaalne erinevus võrreldes punastega?", "Valged kiud reageerivad kiiresti, kuid väsivad samuti kiiresti.", "väsivad kiiresti"],
  ["fys", "Mis on sarkomeer (sarcomere)?","Skeletilihase struktuurne ja funktsionaalne ühik.", "sarkomeer"],
  ["fys", "Millised kaks peamist kontraktiilset valku moodustavad sarkomeeri müofilamendid?", "Aktiin ja müosiin.", "aktiin ja müosiin"],
  ["fys", "Millised kaks regulatoorset valku paiknevad aktiinifilamendi juures skeletilihases?", "Troponiin ja tropomüosiin.", "troponiin ja tropomüosiin"],
  ["fys", "Mis on isotooniline kontraktsioon?", "Kontraktsioon, mille puhul lihase pinge jääb samaks, kuid pikkus muutub.", "isotooniline"],
  ["fys", "Mis vahe on kontsentrilisel ja ekstsentrilisel isotoonilisel kontraktsioonil?", "Kontsentrilisel kontraktsioonil lihas lüheneb, ekstsentrilisel pikeneb pinge all.", "lüheneb vs pikeneb"],
  ["fys", "Mis on isomeetriline kontraktsioon?", "Kontraktsioon, mille puhul lihase pinge suureneb, kuid pikkus ei muutu.", "isomeetriline"],
  ["fys", "Mis moodustab ühe motoorse üksuse (motor unit)?", "Üks motoneuron koos kõigi tema poolt innerveeritavate lihaskiududega.", "motoneuron ja kiud"]
];

export const MUSCLE_CARDS: MuscleCard[] = RAW_CARDS.map((r, i) => ({
  id: i,
  cat: r[0],
  q: r[1],
  a: r[2],
  shortAnswer: r[3]
}));

export interface BossLoot {
  badgeId: string;
  badgeName: string;
  badgeIcon: string;
  badgeRarity: 'Haruldane' | 'Eepiline' | 'Müütiline' | 'Legendaarne';
  title: string;
  lore: string;
}

export interface Boss {
  id: string;
  name: string;
  title: string;
  lore: string;
  avatar: string;
  maxHp: number;
  weakCategory: MuscleCard['cat'];
  specialAbilityName: string;
  specialAbilityDesc: string;
  accentColor: string;
  rewardXp: number;
  loot: BossLoot;
}

export const BOSSES: Boss[] = [
  {
    id: 'boss-1',
    name: 'Sarkomeeri Vaht',
    title: 'Aktiini ja Müosiini Valvur',
    lore: 'Muistne mikroskoopiline hiiglane, kes valvab Z-kettaid ja sarkomeeri lühenemise saladusi.',
    avatar: '🛡️',
    maxHp: 400,
    weakCategory: 'fys',
    specialAbilityName: 'ATP defitsiit',
    specialAbilityDesc: 'Vähendab vastamise aega 30%!',
    accentColor: '#f59e0b',
    rewardXp: 350,
    loot: {
      badgeId: 'badge-boss-1',
      badgeName: 'Z-Ketta Orden',
      badgeIcon: '🧬',
      badgeRarity: 'Haruldane',
      title: 'Sarkomeeri Vahtija',
      lore: 'Omistatud sarkomeeri lühenemise ja aktiini-müosiini sünkrooni valitsejale.'
    }
  },
  {
    id: 'boss-2',
    name: 'Terminite Titaan',
    title: 'Kõõluste ja Kestade Meister',
    lore: 'Epimüüsiumist ja kilekõõlustest kootud võimas rüütel, kes nõuab anatoomilist täpsust.',
    avatar: '⚔️',
    maxHp: 550,
    weakCategory: 'eh',
    specialAbilityName: 'Kõõluse pingutus',
    specialAbilityDesc: 'Eksimuse korral teeb topeltkahju!',
    accentColor: '#e11d48',
    rewardXp: 500,
    loot: {
      badgeId: 'badge-boss-2',
      badgeName: 'Kõõluste Kilp',
      badgeIcon: '🛡️',
      badgeRarity: 'Haruldane',
      title: 'Kõõluste Taltsutaja',
      lore: 'Võltsitud purunematust epimüüsiumist ja kilejatest kõõlustest.'
    }
  },
  {
    id: 'boss-3',
    name: 'Ladina Sõnamaag',
    title: 'Vastuse ja Bicepsi Manaaja',
    lore: 'Ladina tüvedest loitse punuv müstik. Ta ründab deltoideuse ja rectuse jõuga!',
    avatar: '🧙‍♂️',
    maxHp: 700,
    weakCategory: 'nimi',
    specialAbilityName: 'Sõnade virr-varr',
    specialAbilityDesc: 'Segab valikvastuste järjekorda ja peidab vihjeid!',
    accentColor: '#0284c7',
    rewardXp: 700,
    loot: {
      badgeId: 'badge-boss-3',
      badgeName: 'Ladina Loitsuraamat',
      badgeIcon: '📜',
      badgeRarity: 'Eepiline',
      title: 'Müoloogia Manaaja',
      lore: 'Märk kõigi ladinakeelsete lihasetüvede (vastus, brevis, deltoideus) tundmisest.'
    }
  },
  {
    id: 'boss-4',
    name: 'Koe Muundaja',
    title: 'Skeleti-, Sile- ja Südamelihase Alkeemik',
    lore: 'Valdab kõigi kolme lihaskoe ehitust ja inimtahtele alluvuse saladusi.',
    avatar: '🧬',
    maxHp: 800,
    weakCategory: 'kude',
    specialAbilityName: 'Koe mutatsioon',
    specialAbilityDesc: 'Muudab küsimuste vastusevariante ettearvamatult!',
    accentColor: '#ea580c',
    rewardXp: 850,
    loot: {
      badgeId: 'badge-boss-4',
      badgeName: 'Kolme Koe Kristall',
      badgeIcon: '💎',
      badgeRarity: 'Eepiline',
      title: 'Koe Alkeemik',
      lore: 'Kuldne harmoonia skeleti-, sile- ja südamelihaskoe bioloogiast.'
    }
  },
  {
    id: 'boss-5',
    name: 'Biomehaanika Elukas',
    title: 'Painutajate ja Lähendajate Isand',
    lore: 'Hüpertroofiline metsaline, kelle iga samm on ideaalselt koordineeritud mitmeliigeseline liigutus.',
    avatar: '🐲',
    maxHp: 950,
    weakCategory: 'fn',
    specialAbilityName: 'Piimhappe rünnak',
    specialAbilityDesc: 'Ründab ootamatult, kui mõtled liiga kaua!',
    accentColor: '#0d9488',
    rewardXp: 1000,
    loot: {
      badgeId: 'badge-boss-5',
      badgeName: 'Biomehaanika Küünis',
      badgeIcon: '🐾',
      badgeRarity: 'Eepiline',
      title: 'Kineetika Isand',
      lore: 'Tähistab mitmeliigeseliste liikumiste ja adductor/abductor lihaste täielikku kontrolli.'
    }
  },
  {
    id: 'boss-6',
    name: 'Sternocleido Sfinks',
    title: 'Kaelalihaste ja Rangluu Mõistatuste Kaitsja',
    lore: 'Müstiline valvur, kes esitab küsimusi pikima lihase ja nibujätke kinnituste kohta.',
    avatar: '🦅',
    maxHp: 1100,
    weakCategory: 'fn',
    specialAbilityName: 'Sfinksi mõistatus',
    specialAbilityDesc: 'Nõuab välkkiiret reaktsiooni!',
    accentColor: '#06b6d4',
    rewardXp: 1200,
    loot: {
      badgeId: 'badge-boss-6',
      badgeName: 'Sfinksi Kaelavapp',
      badgeIcon: '🦅',
      badgeRarity: 'Eepiline',
      title: 'Sfinksi Mõistataja',
      lore: 'Antud kaelalihaste, rinnaku, rangluu ja rätsepalihase anatoomia mõistatuste murdmise eest.'
    }
  },
  {
    id: 'boss-7',
    name: 'Sulgjas Hüdra',
    title: 'Üheli- ja Kahelisulgjate Lihaste Koletis',
    lore: 'Mitmepäine anatoomiline koletis. Iga kõõlusele kinnituv kiud teeb ta tugevamaks!',
    avatar: '🐍',
    maxHp: 1250,
    weakCategory: 'kuju',
    specialAbilityName: 'Hüdra regeneratsioon',
    specialAbilityDesc: 'Taastab veidi elupunkte, kui vastad valesti!',
    accentColor: '#8b5cf6',
    rewardXp: 1400,
    loot: {
      badgeId: 'badge-boss-7',
      badgeName: 'Sulghübriidi Embleem',
      badgeIcon: '🐍',
      badgeRarity: 'Müütiline',
      title: 'Hüdra Taltsutaja',
      lore: 'Iseloomustab üheli- ja kahelisulgjate lihaskiudude plahvatusliku jõu alistamist.'
    }
  },
  {
    id: 'boss-8',
    name: 'Müoglobiini Draakon',
    title: 'Punaste Kiudude ja Aeroobse Leegi Isand',
    lore: 'Hapnikurikas draakon, kes suudab väsimatult võidelda tunde tänu püsivale müoglobiinivarule.',
    avatar: '🐉',
    maxHp: 1450,
    weakCategory: 'fys',
    specialAbilityName: 'Hapnikupuhang',
    specialAbilityDesc: 'Tekitab tohutut survet ja nõuab 100% täpsust!',
    accentColor: '#f97316',
    rewardXp: 1650,
    loot: {
      badgeId: 'badge-boss-8',
      badgeName: 'Aeroobne Leek',
      badgeIcon: '🔥',
      badgeRarity: 'Müütiline',
      title: 'Aeroobne Draakon',
      lore: 'Sümboliseerib punaste lihaskiudude ja müoglobiini lõputut hapnikuvoolu.'
    }
  },
  {
    id: 'boss-9',
    name: 'Aponeuroosi Raudrüütel',
    title: 'Kilekõõluste ja Epimüüsiumi Läbistamatu Müür',
    lore: 'Loodud laiadest lamedatest kõõlustest ja tihedast sidekoest. Läbistatav vaid süvateadmistega!',
    avatar: '🛡️⚔️',
    maxHp: 1700,
    weakCategory: 'eh',
    specialAbilityName: 'Sidekoeline kilp',
    specialAbilityDesc: 'Tavaline rünnak teeb vähem kahju — kasuta kriitilisi lööke!',
    accentColor: '#e11d48',
    rewardXp: 2000,
    loot: {
      badgeId: 'badge-boss-9',
      badgeName: 'Aponeuroosi Rüütlivapp',
      badgeIcon: '⚔️',
      badgeRarity: 'Müütiline',
      title: 'Kilekõõluse Raudrüütel',
      lore: 'Tunnistus laia lihase kilekõõluse ja sidekoeliste kestade läbistamisest.'
    }
  },
  {
    id: 'boss-10',
    name: 'Ülim Müoloogia Titaan',
    title: 'Kõigi 600 Lihase Absoluutne Valitseja',
    lore: 'Lihasteaduse absoluutne tipp. Teda suudab alistada vaid tõeline anatoomia meister!',
    avatar: '👑',
    maxHp: 2200,
    weakCategory: 'kuju',
    specialAbilityName: 'Tetanus & Hüpertroofia',
    specialAbilityDesc: 'Kombineerib kõigi eelmiste bosside võimsaimad taktikad!',
    accentColor: '#a855f7',
    rewardXp: 2800,
    loot: {
      badgeId: 'badge-boss-10',
      badgeName: '600 Lihase Kroon',
      badgeIcon: '👑',
      badgeRarity: 'Legendaarne',
      title: 'Titaanide Alistaja',
      lore: 'Ülim areeni aumärk: tõestab kõigi inimkeha skeletilihaste absoluutset meisterlikkust.'
    }
  }
];

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
}

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_blood', name: 'Esimene Lihaskiud', desc: 'Vasta esimesele küsimusele õigesti', icon: '🌱', unlocked: false },
  { id: 'streak_5', name: 'Soojendus Tehtud', desc: 'Saavuta 5 järjestikust õiget vastust', icon: '🔥', unlocked: false },
  { id: 'streak_10', name: 'Lihaspump (10x)', desc: 'Saavuta 10 järjestikust õiget vastust', icon: '⚡', unlocked: false },
  { id: 'boss_1', name: 'Sarkomeeri Kangelane', desc: 'Alista esimene boss Musculus Arenal', icon: '🏆', unlocked: false },
  { id: 'boss_5', name: 'Areeni Gladiaator', desc: 'Alista vähemalt 5 bossi', icon: '⚔️', unlocked: false },
  { id: 'boss_all', name: 'Müoloogia Legend', desc: 'Alista kõik 10 areeni bossi', icon: '👑', unlocked: false },
  { id: 'speed_master', name: 'Välgu Kiirus', desc: 'Kogu kiirrünnakus vähemalt 20 õiget vastust', icon: '⏱️', unlocked: false },
  { id: 'latin_pro', name: 'Ladina Keele Magister', desc: 'Õpi selgeks 15 ladina nimetuste kaarti', icon: '📜', unlocked: false },
  { id: 'half_deck', name: 'Pool Anatoomiat', desc: 'Õpi selgeks 30 kaarti 60-st', icon: '⭐', unlocked: false },
  { id: 'full_deck', name: 'Täielik Anatoom', desc: 'Õpi selgeks kõik 60 kaarti', icon: '🌟', unlocked: false },
  { id: 'level_5', name: 'Tugev Tuum', desc: 'Jõua tasemeni 5', icon: '💪', unlocked: false },
  { id: 'level_10', name: 'Hüpertroofia Tipp', desc: 'Jõua tasemeni 10', icon: '🦾', unlocked: false }
];
