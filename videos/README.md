# Medical Videos Folder Structure

This folder contains organized video content for MekkawyMedLearn courses.

## Folder Structure

```
videos/
├── anatomy/          # Anatomy course videos
├── neurology/        # Neurology course videos
├── pathology/        # Pathology course videos
├── pharmacology/     # Pharmacology course videos
├── physiology/       # Physiology course videos
└── surgery/          # Surgery course videos
```

## Supported Video Formats

- **MP4** (recommended) - Best browser compatibility
- **WebM** - Good for modern browsers
- **OGV** - Fallback for older browsers

## Naming Convention

Use descriptive names with lesson numbers:

- `01-introduction.mp4`
- `02-brain-anatomy.mp4`
- `03-cranial-nerves.mp4`

## Adding Videos

1. Place your video files in the appropriate course folder
2. Update the lesson HTML to reference the video path
3. Example: `videos/neurology/01-introduction.mp4`

## Video Player Usage

```html
<video controls width="100%">
  <source src="videos/neurology/01-introduction.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>
```
