// SUST Registration Number Parser (Frontend)

const DEPARTMENT_CODES = {
  331: "CSE",
  338: "EEE",
  339: "Mechanical Engineering",
  333: "Civil Engineering",
  332: "Chemical Engineering",
  334: "IPE",
  336: "PME",
  337: "Food Engineering",
  345: "Architecture",
  831: "Software Engineering",
  132: "Physics",
  310: "Chemistry",
  134: "Statistics",
  136: "Oceanography",
  135: "Geography and Environmental Studies",
  433: "Bio-Chemistry and Molecular Biology",
  431: "Genetic Engineering and Biotechnology",
  631: "Forestry and Environmental Science",
  731: "Business Administration",
  231: "Economics",
  234: "Anthropology",
  235: "Political Studies",
  237: "Public Administration",
  233: "Social Work",
  232: "Sociology",
  236: "English",
  238: "Bangla",
};

export const parseRegistrationNumber = (regNumber) => {
  const cleaned = regNumber.toString().replace(/[^0-9]/g, "");

  if (cleaned.length !== 10) {
    return { isValid: false };
  }

  const year = cleaned.substring(0, 4);
  const departmentCode = cleaned.substring(4, 7);
  const rollNumber = cleaned.substring(7, 10);

  const department = DEPARTMENT_CODES[departmentCode];

  if (!department) {
    return { isValid: false };
  }

  return {
    isValid: true,
    year: parseInt(year),
    batch: year,
    departmentCode,
    department,
    rollNumber: parseInt(rollNumber),
    fullRegNumber: cleaned,
  };
};

export const extractRegNumberFromEmail = (email) => {
  if (!email) return null;
  const username = email.split("@")[0];
  const regNumber = username.replace(/[^0-9]/g, "");
  return regNumber.length === 10 ? regNumber : null;
};

export const parseStudentEmail = (email) => {
  const regNumber = extractRegNumberFromEmail(email);
  if (!regNumber) return { isValid: false };
  return parseRegistrationNumber(regNumber);
};

export const getDepartmentList = () => {
  return Object.entries(DEPARTMENT_CODES)
    .map(([code, name]) => ({
      code,
      name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};
