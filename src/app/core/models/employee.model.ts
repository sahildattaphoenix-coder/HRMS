export interface User {
  id: string;
  email: string;
  password?: string;
  role: 'admin' | 'employee';
  name: string;
  designation?: string;
  img?: string;
}

export interface Employee {
  id: string;
  userId: string;
  name: string;
  email: string;
  empNo: string;
  department: string;
  designation: string;
  joiningDate: string;
  mobile: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  age: number;
  country: string;
  bloodGroup: string;
  qualification: string;
  reportingTo: string;
  status: 'Active' | 'Inactive';
  workMode?: 'On-site' | 'Remote' | 'WFH';
  img: string;
  address: Address;
  bank: BankDetails;
  experience?: WorkExperience[];
  education?: EducationRecord[];
}

export interface Address {
  country: string;
  state: string;
  city: string;
  pincode: string;
  street: string;
  homeNo: string;
}

export interface BankDetails {
  name: string;
  accountNo: string;
  ifsc: string;
  pincode: string;
  location: string;
  aadhar: string;
  pan: string;
}

export interface WorkExperience {
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface EducationRecord {
  degree: string;
  school: string;
  year: string;
}
