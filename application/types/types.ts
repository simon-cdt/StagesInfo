import { SubmissionStatus, OfferStatus } from "@prisma/client";

export type Role = "student" | "company" | "admin";

export type FetchSectorsList = {
  id: string;
  label: string;
  color: string;
}[];

export type FetchAllOffers = {
  company: {
    name: string;
  };
  sector: {
    id: string;
    label: string;
    color: string;
  };
  id: string;
  title: string;
  duration: string;
  startDate: Date;
  endDate: Date;
  location: string;
  skills: string;
}[];

export type FetchOfferDetails = {
  offer: {
    id: string;
    sector: {
      label: string;
      color: string;
    };
    title: string;
    status: OfferStatus;
    location: string;
    duration: string;
    startDate: string;
    endDate: string;
    description: string;
    skills: string;
    company: {
      name: string;
      address: string;
      email: string;
      contact: {
        name: string;
        email: string;
        firstName: string;
      };
    };
  };
  expired: boolean;
  alreadySubmit: boolean;
};

export type FetchStudentInfo = {
  name: string;
  firstName: string;
  email: string;
  resume: Uint8Array<ArrayBufferLike>;
  skills: string;
};

export type FetchStudentSubmissions = [
  {
    id: string;
    date: Date;
    status: SubmissionStatus;
    offer: {
      id: string;
      title: string;
      status: OfferStatus;
      company: {
        name: string;
      };
    };
  },
];

export type FetchStudentEvaluations = [
  {
    id: string;
    evaluation: {
      rating: 4;
      date: Date;
      comment: string;
    } | null;
    title: string;
    company: {
      name: string;
      contact: {
        name: string;
        firstName: string;
        email: string;
      };
    };
  },
];

export type FetchCompanyOffers = [
  {
    id: string;
    title: string;
    description: string;
    sector: {
      id: string;
      color: string;
      label: string;
    };
    duration: string;
    startDate: Date;
    endDate: Date;
    location: string;
    status: OfferStatus;
    skills: string;
  },
];

export type FetchCompanyOfferSubmissions = [
  {
    id: string;
    student: {
      id: string;
      name: string;
      firstName: string;
      email: string;
      skills: string;
    };
    date: Date;
    status: SubmissionStatus;
    stage: {
      status: OfferStatus;
      endDate: Date;
    };
    disable: boolean;
  },
];

export type FetchCompanyOfferEvaluations = [
  {
    id: string;
    student: {
      id: string;
      name: string;
      firstName: string;
      email: string;
    };
    offer: {
      id: string;
      title: string;
      evaluation: {
        id: string;
        rating: number;
        comment: string;
        date: Date;
      } | null;
    };
  },
];

// eslint-disable-next-line
export const colorMap: any = {
  blue: {
    border: "border-blue-200",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  red: {
    border: "border-red-200",
    bg: "bg-red-50",
    text: "text-red-700",
  },
  green: {
    border: "border-green-200",
    bg: "bg-green-50",
    text: "text-green-700",
  },
  lime: {
    border: "border-lime-200",
    bg: "bg-lime-50",
    text: "text-lime-700",
  },
  purple: {
    border: "border-purple-200",
    bg: "bg-purple-50",
    text: "text-purple-700",
  },
  orange: {
    border: "border-orange-200",
    bg: "bg-orange-50",
    text: "text-orange-700",
  },
  pink: {
    border: "border-pink-200",
    bg: "bg-pink-50",
    text: "text-pink-700",
  },
  cyan: {
    border: "border-cyan-200",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
  },
  teal: {
    border: "border-teal-200",
    bg: "bg-teal-50",
    text: "text-teal-700",
  },
};
