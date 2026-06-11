const { calculateAge, calculateBMI, getWeightStatus, generatePetId, getSpeciesIcon, getSpeciesName, getBreedOptions, formatPersonality, getPetGreeting } = require('../utils/pet-utils');

describe('pet-utils', () => {
  describe('calculateAge', () => {
    test('calculates age from recent birthday', () => {
      const recent = new Date();
      recent.setFullYear(recent.getFullYear() - 2);
      const age = calculateAge(recent.toISOString().split('T')[0]);
      expect(age.years).toBe(2);
      expect(age.display).toContain('2岁');
    });
    test('returns unknown for null', () => {
      const age = calculateAge(null);
      expect(age.display).toBe('未知');
    });
  });

  describe('calculateBMI', () => {
    test('calculates BMI for cat', () => {
      const result = calculateBMI(4.8, 'cat');
      expect(result.bmi).toBeGreaterThan(0);
      expect(result.category).toBeTruthy();
      expect(result.suggestion).toBeTruthy();
    });
    test('returns unknown for zero weight', () => {
      const result = calculateBMI(0, 'cat');
      expect(result.category).toBe('未知');
    });
  });

  describe('getWeightStatus', () => {
    test('classifies cat BMI correctly', () => {
      expect(getWeightStatus(15, 'cat')).toBe('偏瘦');
      expect(getWeightStatus(20, 'cat')).toBe('正常');
      expect(getWeightStatus(27, 'cat')).toBe('偏胖');
      expect(getWeightStatus(35, 'cat')).toBe('肥胖');
    });
    test('classifies dog BMI correctly', () => {
      expect(getWeightStatus(13, 'dog')).toBe('偏瘦');
      expect(getWeightStatus(20, 'dog')).toBe('正常');
      expect(getWeightStatus(27, 'dog')).toBe('偏胖');
      expect(getWeightStatus(35, 'dog')).toBe('肥胖');
    });
  });

  describe('generatePetId', () => {
    test('generates unique ids with prefix', () => {
      const id1 = generatePetId();
      const id2 = generatePetId();
      expect(id1).toMatch(/^pet_/);
      expect(id2).not.toBe(id1);
    });
  });

  describe('getSpeciesIcon', () => {
    test('returns correct emoji', () => {
      expect(getSpeciesIcon('cat')).toBe('🐱');
      expect(getSpeciesIcon('dog')).toBe('🐶');
      expect(getSpeciesIcon('rabbit')).toBe('🐰');
      expect(getSpeciesIcon('unknown')).toBe('🐾');
    });
  });

  describe('getSpeciesName', () => {
    test('returns Chinese name', () => {
      expect(getSpeciesName('cat')).toBe('猫');
      expect(getSpeciesName('dog')).toBe('狗');
    });
  });

  describe('getBreedOptions', () => {
    test('returns breeds for cat', () => {
      const breeds = getBreedOptions('cat');
      expect(breeds.length).toBeGreaterThan(5);
      expect(breeds).toContain('布偶猫');
    });
    test('returns breeds for dog', () => {
      const breeds = getBreedOptions('dog');
      expect(breeds).toContain('金毛寻回犬');
    });
    test('returns other for unknown', () => {
      const breeds = getBreedOptions('unknown');
      expect(breeds).toContain('其他');
    });
  });

  describe('formatPersonality', () => {
    test('formats tags', () => {
      expect(formatPersonality(['活泼', '粘人'])).toBe('活泼·粘人');
    });
    test('returns empty for empty array', () => {
      expect(formatPersonality([])).toBe('');
    });
    test('filters falsy values', () => {
      expect(formatPersonality(['活泼', null, '粘人'])).toBe('活泼·粘人');
    });
  });

  describe('getPetGreeting', () => {
    test('includes pet name', () => {
      const greeting = getPetGreeting('Mochi');
      expect(greeting).toContain('Mochi');
    });
  });
});
