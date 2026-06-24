
export interface User {
    _id: number;
    studentFirstName: string;
    studentLastName: string;
    assignedTeacher: string;
    classStatus: string;
    trialClassStatus: string;
    paymentStatus: string;
    studentId: string;
    fname: string;
    lname: string;
    email: string;
    number: string;
    country: string;
    course: string;
    preferredTeacher: string;
    date: string;
    time: string;
    evaluationStatus?: string;
    city?: string;
    students?: number;
    comment?: string;
    preferredDate?: Date;
    numberofstudents: number;
    status: string;
} 