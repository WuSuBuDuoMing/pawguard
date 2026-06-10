const petService = require('../../services/pet-service');
const albumService = require('../../services/album-service');
const themeBehavior = require('../../utils/theme-behavior');

Page({
  behaviors: [themeBehavior],
  data: {
    pets: [], petNames: [], petIndex: 0, currentPetId: '', currentPetName: '', currentPetSpecies: 'cat',
    photos: [], filteredPhotos: [], groupedPhotos: [], stats: null,
    activeTag: '', showPhotoDetail: false, selectedPhoto: {},
  },
  onShow() { this.init(); },
  async init() {
    const pets = await petService.getAllPets();
    this.setData({ pets, petNames: pets.map(p => p.name), currentPetId: pets[0]?.id, currentPetName: pets[0]?.name, currentPetSpecies: pets[0]?.species || 'cat' });
    this.loadData();
  },
  onPetChange(e) {
    const idx = e.detail.value;
    const pet = this.data.pets[idx];
    this.setData({ petIndex: idx, currentPetId: pet.id, currentPetName: pet.name, currentPetSpecies: pet.species, activeTag: '' });
    this.loadData();
  },
  async loadData() {
    const [photos, stats] = await Promise.all([
      albumService.getPhotos(this.data.currentPetId),
      albumService.getPhotoStats(this.data.currentPetId),
    ]);
    this.setData({ photos, filteredPhotos: photos, stats });
    this.groupPhotos(photos);
  },

  groupPhotos(photos) {
    const dateMap = {};
    photos.forEach(p => {
      const key = p.date || '未知日期';
      if (!dateMap[key]) dateMap[key] = [];
      dateMap[key].push(p);
    });
    const groupedPhotos = Object.entries(dateMap)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, photos]) => ({
        date, dateLabel: this.formatDateLabel(date), photos,
      }));
    this.setData({ groupedPhotos });
  },

  formatDateLabel(dateStr) {
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return '今天';
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dateStr === yesterday) return '昨天';
    return dateStr;
  },

  onTagFilter(e) {
    const tag = e.currentTarget.dataset.tag;
    const activeTag = this.data.activeTag === tag ? '' : tag;
    const filtered = activeTag ? this.data.photos.filter(p => (p.tags || []).includes(activeTag)) : this.data.photos;
    this.setData({ activeTag, filteredPhotos: filtered });
    this.groupPhotos(filtered);
  },

  onPhotoTap(e) {
    const { photos, index } = e.detail;
    this.setData({ showPhotoDetail: true, selectedPhoto: photos[index] || {} });
  },
  hidePhotoDetail() { this.setData({ showPhotoDetail: false }); },
});
