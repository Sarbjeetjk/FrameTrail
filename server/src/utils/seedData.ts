import { MediaType } from '../models/Media';

export interface SeedMediaItem {
  title: string;
  description: string;
  type: MediaType;
  url: string;
  r2Key?: string;
  category: string;
  tags: string[];
  metadata: {
    resolution?: string;
    width?: number;
    height?: number;
    fileSize?: number;
    mimeType?: string;
    duration?: number;
    releaseYear?: number;
    rating?: number;
    director?: string;
    cast?: string[];
    thumbnailUrl?: string;
  };
  views?: number;
  likes?: number;
  isFeatured?: boolean;
}

const PHOTO_CATEGORIES = ['New Delhi', 'Jaipur', 'Himachal', 'Rajgir', 'Punjab', 'Vrindavan', 'Mathura', 'Mumbai', 'Varanasi', 'Goa', 'Kashmir', 'Kolkata'];

const UNSPLASH_IMAGES = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  'https://images.unsplash.com/photo-1511576661531-b34d7da5d0bb',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d',
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e',
  'https://images.unsplash.com/photo-1518791841217-8f162f1e1131',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1',
  'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb',
  'https://images.unsplash.com/photo-1519501025264-65ba15a82390',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
  'https://images.unsplash.com/photo-1514565131-fce0801e5785',
  'https://images.unsplash.com/photo-1508739773434-c26b3d09e071',
  'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b675',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
  'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa',
];

const PHOTO_ADJECTIVES = ['Ethereal', 'Neon', 'Majestic', 'Serene', 'Luminous', 'Silent', 'Vibrant', 'Monochrome', 'Futuristic', 'Golden', 'Cosmic', 'Prismatic', 'Velvet', 'Atmospheric', 'Horizon'];
const PHOTO_NOUNS = ['Visions', 'Echoes', 'Structure', 'Sanctuary', 'Lights', 'Flow', 'Reflection', 'Passage', 'Realm', 'Solitude', 'Drift', 'Symphony', 'Cascade', 'Mirage', 'Apex'];

// Generate 520 realistic photo metadata objects
export const generatePhotoSeedData = (): SeedMediaItem[] => {
  const photos: SeedMediaItem[] = [];

  for (let i = 1; i <= 520; i++) {
    const category = PHOTO_CATEGORIES[i % PHOTO_CATEGORIES.length];
    const adj = PHOTO_ADJECTIVES[i % PHOTO_ADJECTIVES.length];
    const noun = PHOTO_NOUNS[(i * 3) % PHOTO_NOUNS.length];
    const baseUrl = UNSPLASH_IMAGES[i % UNSPLASH_IMAGES.length];
    const imageUrl = `${baseUrl}?auto=format&fit=crop&w=1200&q=80&sig=${i}`;

    photos.push({
      title: `${adj} ${noun} #${i}`,
      description: `A breathtaking capture of ${category.toLowerCase()} scene showcasing detailed textures, dynamic lighting, and fine detail. Item #${i} in the FrameTrail global vault.`,
      type: 'photo',
      url: imageUrl,
      r2Key: `photos/photogallery_${i}.jpg`,
      category: category,
      tags: [category.toLowerCase(), adj.toLowerCase(), '4k', 'gallery', 'frametrail'],
      metadata: {
        resolution: i % 2 === 0 ? '3840x2160' : '1920x1080',
        width: i % 2 === 0 ? 3840 : 1920,
        height: i % 2 === 0 ? 2160 : 1080,
        fileSize: Math.floor(1500000 + (i * 12345) % 3500000),
        mimeType: 'image/jpeg',
      },
      views: Math.floor(120 + (i * 47) % 4500),
      likes: Math.floor(15 + (i * 19) % 890),
      isFeatured: i % 15 === 0,
    });
  }

  return photos;
};

// 25 Curated High-Definition Video items
export const VIDEO_SEED_DATA: SeedMediaItem[] = [
  {
    title: 'Tears of Steel - Cyberpunk VFX Masterpiece',
    description: 'An open source sci-fi short film rendered with Blender. Set in a dystopian future exploring high-tech robotic warfare and emotional artificial intelligence.',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    r2Key: 'videos/tears_of_steel.mp4',
    category: 'Cyberpunk',
    tags: ['blender', 'scifi', 'vfx', 'cyberpunk', '4k'],
    metadata: {
      resolution: '1920x1080',
      duration: 734,
      mimeType: 'video/mp4',
      fileSize: 45000000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    },
    views: 12450,
    likes: 3120,
    isFeatured: true,
  },
  {
    title: 'Big Buck Bunny 4K Cinematic Showcase',
    description: 'A large and lovable rabbit takes revenge on bullying forest creatures in this iconic open movie production.',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    r2Key: 'videos/big_buck_bunny.mp4',
    category: 'Animation',
    tags: ['animation', 'nature', '3d', 'blender'],
    metadata: {
      resolution: '3840x2160',
      duration: 596,
      mimeType: 'video/mp4',
      fileSize: 68000000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    },
    views: 18900,
    likes: 4210,
    isFeatured: true,
  },
  {
    title: 'Sintel - The Dragon Quest Cinematic',
    description: 'A lonely young woman named Sintel searches for a baby dragon she nurtured and lost in a vast fantasy universe.',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    r2Key: 'videos/sintel.mp4',
    category: 'Fantasy',
    tags: ['fantasy', 'dragon', 'cinematic', 'adventure'],
    metadata: {
      resolution: '1920x1080',
      duration: 888,
      mimeType: 'video/mp4',
      fileSize: 52000000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    },
    views: 15400,
    likes: 3900,
    isFeatured: true,
  },
  {
    title: 'Oceanic Wonders - Deep Sea Documentary',
    description: 'Explore marine life ecosystems, coral reef biodiversity, and abyssal depths captured with Ultra-HD underwater cameras.',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    r2Key: 'videos/oceanic_wonders.mp4',
    category: 'Nature',
    tags: ['nature', 'ocean', 'documentary', 'wildlife'],
    metadata: {
      resolution: '3840x2160',
      duration: 410,
      mimeType: 'video/mp4',
      fileSize: 32000000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    },
    views: 8900,
    likes: 1980,
    isFeatured: false,
  },
  {
    title: 'Urban Drift - Tokyo Night Life Timelapse',
    description: 'High speed hyperlapse through Shinjuku neon avenues, Shibuya crossing, and elevated expressways.',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    r2Key: 'videos/urban_drift.mp4',
    category: 'Urban',
    tags: ['urban', 'tokyo', 'timelapse', 'night', 'neon'],
    metadata: {
      resolution: '3840x2160',
      duration: 320,
      mimeType: 'video/mp4',
      fileSize: 28000000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    },
    views: 11200,
    likes: 2750,
    isFeatured: true,
  },
];

// Generate 20 additional videos dynamically to reach 25+ total video records
for (let v = 6; v <= 25; v++) {
  VIDEO_SEED_DATA.push({
    title: `Cinematic Visual Reel Vol. ${v}`,
    description: `A dynamic montage of motion graphics, drone aerials, and sound design. Video record #${v} in FrameTrail R2 Storage.`,
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    r2Key: `videos/visual_reel_${v}.mp4`,
    category: v % 2 === 0 ? 'Architecture' : 'Abstract',
    tags: ['motion', 'drone', 'cinematic', 'hd'],
    metadata: {
      resolution: '1920x1080',
      duration: 180 + v * 15,
      mimeType: 'video/mp4',
      fileSize: 22000000 + v * 1000000,
      thumbnailUrl: `https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80&sig=${v + 500}`,
    },
    views: 3000 + v * 200,
    likes: 800 + v * 40,
    isFeatured: v % 5 === 0,
  });
}

// 15 Curated Full Feature Movie Records
export const MOVIE_SEED_DATA: SeedMediaItem[] = [
  {
    title: 'Interstellar Horizons',
    description: 'A team of explorers travel through a wormhole near Saturn in search of a new habitable home for humanity.',
    type: 'movie',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    r2Key: 'movies/interstellar_horizons.mp4',
    category: 'Sci-Fi',
    tags: ['scifi', 'space', 'blockbuster', 'epic'],
    metadata: {
      resolution: '3840x2160',
      duration: 10140, // 2h 49m
      releaseYear: 2024,
      rating: 9.2,
      director: 'Christopher Nolan',
      cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    },
    views: 45000,
    likes: 12800,
    isFeatured: true,
  },
  {
    title: 'The Neon Syndicate',
    description: 'In the year 2088, a rogue cybernetic detective uncovers a conspiracy operating in the digital underworld of Neo-Berlin.',
    type: 'movie',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    r2Key: 'movies/neon_syndicate.mp4',
    category: 'Cyberpunk',
    tags: ['cyberpunk', 'action', 'mystery', 'future'],
    metadata: {
      resolution: '3840x2160',
      duration: 7800, // 2h 10m
      releaseYear: 2025,
      rating: 8.8,
      director: 'Denis Villeneuve',
      cast: ['Ryan Gosling', 'Ana de Armas', 'Sylvia Hoeks'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    },
    views: 38900,
    likes: 9800,
    isFeatured: true,
  },
  {
    title: 'Chronicles of Aethelgard',
    description: 'An ancient kingdom faces oblivion when forgotten dark sorcery reawakens in the high northern peaks.',
    type: 'movie',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    r2Key: 'movies/aethelgard.mp4',
    category: 'Fantasy',
    tags: ['fantasy', 'magic', 'adventure', 'sword'],
    metadata: {
      resolution: '3840x2160',
      duration: 11500, // 3h 11m
      releaseYear: 2023,
      rating: 9.4,
      director: 'Peter Jackson',
      cast: ['Viggo Mortensen', 'Cate Blanchett', 'Ian McKellen'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    },
    views: 52000,
    likes: 14200,
    isFeatured: true,
  },
  {
    title: 'Apex Predator: Deep Waters',
    description: 'Marine biologists stranded on a deep-sea research station battle an unclassified prehistoric sea creature.',
    type: 'movie',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    r2Key: 'movies/apex_predator.mp4',
    category: 'Thriller',
    tags: ['thriller', 'survival', 'ocean', 'monster'],
    metadata: {
      resolution: '1920x1080',
      duration: 6400,
      releaseYear: 2024,
      rating: 7.9,
      director: 'Ridley Scott',
      cast: ['Sigourney Weaver', 'Michael Fassbender'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    },
    views: 21000,
    likes: 4900,
    isFeatured: false,
  },
  {
    title: 'Quantum Velocity',
    description: 'Formula 1 racing meets experimental quantum engine technology in a high-octane global rivalry.',
    type: 'movie',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    r2Key: 'movies/quantum_velocity.mp4',
    category: 'Action',
    tags: ['racing', 'action', 'cars', 'speed'],
    metadata: {
      resolution: '3840x2160',
      duration: 7200,
      releaseYear: 2025,
      rating: 8.6,
      director: 'Joseph Kosinski',
      cast: ['Brad Pitt', 'Damson Idris', 'Javier Bardem'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    },
    views: 31000,
    likes: 8100,
    isFeatured: true,
  },
];

// Generate 10 more movie entries to reach 15 full feature films
for (let m = 6; m <= 15; m++) {
  MOVIE_SEED_DATA.push({
    title: `Legacy of the Eclipse ${m}`,
    description: `A gripping saga of betrayal, triumph, and futuristic statecraft across planetary colonies. Feature Film #${m}.`,
    type: 'movie',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    r2Key: `movies/legacy_eclipse_${m}.mp4`,
    category: m % 2 === 0 ? 'Sci-Fi' : 'Drama',
    tags: ['epic', 'drama', 'cinema'],
    metadata: {
      resolution: '3840x2160',
      duration: 6800 + m * 300,
      releaseYear: 2022 + (m % 4),
      rating: 8.0 + (m % 10) * 0.15,
      director: `Director Studio ${m}`,
      cast: [`Actor Alpha ${m}`, `Actor Beta ${m}`],
      thumbnailUrl: `https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80&sig=${m + 900}`,
    },
    views: 15000 + m * 1200,
    likes: 3500 + m * 350,
    isFeatured: m % 3 === 0,
  });
}
