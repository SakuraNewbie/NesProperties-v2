// Map links collection organized by property ID
export const propertyMaps = {
  1: {
    location: "Beverly Hills, CA",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.0548929421184!2d100.9392661748564!3d4.760464095214776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cabdaa45034fb1%3A0xb9c457972f8c221d!2sTaman%20Jati%20Fasa%202!5e0!3m2!1sen!2smy!4v1747510896823!5m2!1sen!2smy",
    directLink: "https://maps.app.goo.gl/FSTdudfdbu9M9Svt7"
  },
  2: {
    location: "Manhattan, NY",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1988.0289397949896!2d100.92783478404414!3d4.759947262279674!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cabd49c56b7dad%3A0x7c785401dc367dd!2sTaman%20Sentosa!5e0!3m2!1sen!2smy!4v1747510673132!5m2!1sen!2smy",
    directLink: "https://maps.app.goo.gl/VU91VzDbMGPnTXNy7"
  },
  3: {
    location: "Chandan Puteri, Kuala Kangsar",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1988.02714825786!2d100.93818943851281!3d4.7605672988036725!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cabdabbb4ddf59%3A0x3485d57474500ed8!2s367%2C%20Persiaran%20Putri%202%2C%20Chandan%20Putri%2C%2033000%20Kuala%20Kangsar%2C%20Perak!5e0!3m2!1sen!2smy!4v1747512288528!5m2!1sen!2smy",
    directLink: "https://maps.app.goo.gl/Tur4bTNw1gYgW2zF8"
  },
  4: {
    location: "Chicago, IL",
    embedUrl: "https://www.google.com/maps/embed?pb=!4v1747513207437!6m8!1m7!1sYj7y_Hahyeuu-DFLILm0QA!2m2!1d4.75814396887646!2d100.9395314356066!3f37.25783491147721!4f-1.2057719474707653!5f0.7820865974627469",
    directLink: "https://maps.app.goo.gl/mAT7q7PYc9aD7yjo6"
  },
  5: {
    location: "Aspen, CO",
    embedUrl: "https://www.google.com/maps/embed?pb=!4v1747513779223!6m8!1m7!1sNTgx4k7wvKKIP-3VzQGUPQ!2m2!1d4.763954416510636!2d100.9431382198232!3f236.89760816965617!4f-13.431479190004467!5f0.7820865974627469",
    directLink: "https://maps.app.goo.gl/xoYwwgAWuPj7bYjt6"
  },
  6: {
    location: "Taman Kopeka, Kuala Kangsar",
    embedUrl: "https://www.google.com/maps/embed?pb=!4v1747514012746!6m8!1m7!1s6a8dQ_hGqYbx8VzWDy9K7w!2m2!1d4.755892777723622!2d100.9438824732622!3f343.9962890873821!4f0.32045145937071595!5f1.1924812503605782",
    directLink: "https://maps.app.goo.gl/VpSYPid287iXD4KG7"
  }
};

// Helper function to generate map embed URL from location string
export const getMapEmbedUrl = (location) => {
  return `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`;
};

// Helper function to generate direct map link from location string
export const getMapDirectLink = (location) => {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
};