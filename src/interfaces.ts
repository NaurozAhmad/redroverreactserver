export interface IResort {
  _id: string;
  name: string;
  description: string;
  location: ILocation;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  rating: number;
  reviews: IReview[];
  reviewsCount: number;
  dateCreated: string;
  accommodations: IAccommodation[];
  amenities: string[];
  nearbyAttractions: INearbyAttraction[];
  rules: string[];
  cancellationPolicy: string;
  faqs: IFAQ[];
  localActivities: ILocalActivity[];
  events: IEvent[];
  images: string[];
  price: number;
  accommodationsCount: number;
  amenitiesCount: number;
  nearbyAttractionsCount: number;
  faqsCount: number;
  localActivitiesCount: number;
  eventsCount: number;
  imagesCount: number;
};

export interface IReview {
  rating: number;
  review: string;
  reviewBy: string;
  dateCreated: string;
};

export interface IAccommodation {
  name: string;
  description: string;
};

export interface ILocation {
  lat: number;
  long: number;
};

export interface INearbyAttraction {
  name: string;
  description: string;
  image: string;
};

export interface IFAQ {
  question: string;
  answer: string;
};

export interface ILocalActivity {
  name: string;
  description: string;
  image: string;
};

export interface IEvent {
  _id: string;
  name: string;
  description: string;
  images: string[];
  resortId: string;
  dateCreated: string;
};

export interface IUser {
  _id: string;
  username: string;
  password: string;
  salt: string;
  email: string;
  firstName: string;
  lastName: string;
}