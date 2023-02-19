import { Schema, model } from 'mongoose';
import { IResort } from '../interfaces';

const ResortSchema = new Schema<IResort>({
  name: String,
  description: String,
  phone: String,
  location: {
    lat: Number,
    long: Number
  },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String
  },
  rating: Number,
  reviews: [{
    rating: Number,
    review: String,
    reviewBy: String,
    dateCreated: String
  }],
  dateCreated: String,
  accommodations: [{
    name: String,
    description: String
  }],
  amenities: [String],
  nearbyAttractions: [{
    name: String,
    description: String,
    address: String,
    image: String
  }],
  rules: [String],
  cancellationPolicy: String,
  faqs: [{
    question: String,
    answer: String
  }],
  localActivities: [{
    name: String,
    description: String,
    image: String
  }],
  events: [{
    name: String,
    description: String,
    images: [String],
    resortId: String,
    dateCreated: String
  }],
  images: [String],
  price: Number
});

const Resort = model('Resort', ResortSchema);

export default Resort;