-- ===========================================
-- TrueLevel V0 Seed Data
-- Reference data for injectors, tips, and conversions
-- ===========================================

-- ===========================================
-- INJECTOR TYPES
-- ===========================================

-- Hydroflex Injectors
INSERT INTO "InjectorType" (id, system, name, gpm) VALUES
('hydroflex-white', 'HYDROFLEX', 'White', 0.25),
('hydroflex-yellow', 'HYDROFLEX', 'Yellow', 0.50),
('hydroflex-tan', 'HYDROFLEX', 'Tan', 0.75),
('hydroflex-red', 'HYDROFLEX', 'Red', 1.00),
('hydroflex-orange', 'HYDROFLEX', 'Orange', 1.50),
('hydroflex-gray', 'HYDROFLEX', 'Gray', 2.00),
('hydroflex-blue', 'HYDROFLEX', 'Blue', 2.25),
('hydroflex-light-blue', 'HYDROFLEX', 'Light Blue', 3.00),
('hydroflex-light-green', 'HYDROFLEX', 'Light Green', 3.25),
('hydroflex-pink', 'HYDROFLEX', 'Pink', 3.75),
('hydroflex-purple', 'HYDROFLEX', 'Purple', 4.50),
('hydroflex-dark-green', 'HYDROFLEX', 'Dark Green', 5.50),
('hydroflex-black-8-0', 'HYDROFLEX', 'Black (8.0)', 8.00),
('hydroflex-black-10-0', 'HYDROFLEX', 'Black (10.0)', 10.00),
('hydroflex-black-12-0', 'HYDROFLEX', 'Black (12.0)', 12.00),
('hydroflex-black-15-0', 'HYDROFLEX', 'Black (15.0)', 15.00);

-- Hydrominder Injectors
INSERT INTO "InjectorType" (id, system, name, gpm) VALUES
('hydrominder-515', 'HYDROMINDER', '515', 1.50),
('hydrominder-e-gap-5111', 'HYDROMINDER', 'E Gap 5111', 3.50),
('hydrominder-511', 'HYDROMINDER', '511', 4.50),
('hydrominder-532', 'HYDROMINDER', '532', 6.00),
('hydrominder-530', 'HYDROMINDER', '530', 9.00),
('hydrominder-546-551', 'HYDROMINDER', '546/551', 18.00),
('hydrominder-560-565', 'HYDROMINDER', '560/565', 25.00);

-- ===========================================
-- TIP TYPES
-- ===========================================

-- Standard Tips
INSERT INTO "TipType" (id, system, name, "dilutionRatio") VALUES
('standard-copper', 'HYDROFLEX', 'Copper', '1:1'),
('standard-pumpkin', 'HYDROFLEX', 'Pumpkin', '1:2'),
('standard-burgundy', 'HYDROFLEX', 'Burgundy', '1:3'),
('standard-lime', 'HYDROFLEX', 'Lime', '1:4'),
('standard-tan', 'HYDROFLEX', 'Tan', '1:5'),
('standard-orange', 'HYDROFLEX', 'Orange', '1:6'),
('standard-turquoise', 'HYDROFLEX', 'Turquoise', '1:7'),
('standard-pink', 'HYDROFLEX', 'Pink', '1:8'),
('standard-light-blue', 'HYDROFLEX', 'Light Blue', '1:9'),
('standard-brown', 'HYDROFLEX', 'Brown', '1:10'),
('standard-red', 'HYDROFLEX', 'Red', '1:11'),
('standard-white', 'HYDROFLEX', 'White', '1:12'),
('standard-green', 'HYDROFLEX', 'Green', '1:13'),
('standard-blue', 'HYDROFLEX', 'Blue', '1:14'),
('standard-yellow', 'HYDROFLEX', 'Yellow', '1:15'),
('standard-black', 'HYDROFLEX', 'Black', '1:16'),
('standard-purple', 'HYDROFLEX', 'Purple', '1:17'),
('standard-gray', 'HYDROFLEX', 'Gray', '1:18');

-- Hydrominder Tips
INSERT INTO "TipType" (id, system, name, "dilutionRatio") VALUES
('hydrominder-beige', 'HYDROMINDER', 'Beige', '1:6'),
('hydrominder-dk-blue', 'HYDROMINDER', 'Dk. Blue', '1:10'),
('hydrominder-yellow', 'HYDROMINDER', 'Yellow', '1:16'),
('hydrominder-aqua', 'HYDROMINDER', 'Aqua', '1:32'),
('hydrominder-precision', 'HYDROMINDER', 'Precision', '1:64'),
('hydrominder-lt-purple', 'HYDROMINDER', 'Lt. Purple', '1:96'),
('hydrominder-olive', 'HYDROMINDER', 'Olive', '1:128'),
('hydrominder-red-purple', 'HYDROMINDER', 'Red Purple', '1:192'),
('hydrominder-lt-orange', 'HYDROMINDER', 'Lt. Orange', '1:256');

-- Dial Tips (1-32)
INSERT INTO "TipType" (id, system, name, "dilutionRatio") VALUES
('dial-dial-1', 'HYDROFLEX', 'Dial 1', 'Variable'),
('dial-dial-2', 'HYDROFLEX', 'Dial 2', 'Variable'),
('dial-dial-3', 'HYDROFLEX', 'Dial 3', 'Variable'),
('dial-dial-4', 'HYDROFLEX', 'Dial 4', 'Variable'),
('dial-dial-5', 'HYDROFLEX', 'Dial 5', 'Variable'),
('dial-dial-6', 'HYDROFLEX', 'Dial 6', 'Variable'),
('dial-dial-7', 'HYDROFLEX', 'Dial 7', 'Variable'),
('dial-dial-8', 'HYDROFLEX', 'Dial 8', 'Variable'),
('dial-dial-9', 'HYDROFLEX', 'Dial 9', 'Variable'),
('dial-dial-10', 'HYDROFLEX', 'Dial 10', 'Variable'),
('dial-dial-11', 'HYDROFLEX', 'Dial 11', 'Variable'),
('dial-dial-12', 'HYDROFLEX', 'Dial 12', 'Variable'),
('dial-dial-13', 'HYDROFLEX', 'Dial 13', 'Variable'),
('dial-dial-14', 'HYDROFLEX', 'Dial 14', 'Variable'),
('dial-dial-15', 'HYDROFLEX', 'Dial 15', 'Variable'),
('dial-dial-16', 'HYDROFLEX', 'Dial 16', 'Variable'),
('dial-dial-17', 'HYDROFLEX', 'Dial 17', 'Variable'),
('dial-dial-18', 'HYDROFLEX', 'Dial 18', 'Variable'),
('dial-dial-19', 'HYDROFLEX', 'Dial 19', 'Variable'),
('dial-dial-20', 'HYDROFLEX', 'Dial 20', 'Variable'),
('dial-dial-21', 'HYDROFLEX', 'Dial 21', 'Variable'),
('dial-dial-22', 'HYDROFLEX', 'Dial 22', 'Variable'),
('dial-dial-23', 'HYDROFLEX', 'Dial 23', 'Variable'),
('dial-dial-24', 'HYDROFLEX', 'Dial 24', 'Variable'),
('dial-dial-25', 'HYDROFLEX', 'Dial 25', 'Variable'),
('dial-dial-26', 'HYDROFLEX', 'Dial 26', 'Variable'),
('dial-dial-27', 'HYDROFLEX', 'Dial 27', 'Variable'),
('dial-dial-28', 'HYDROFLEX', 'Dial 28', 'Variable'),
('dial-dial-29', 'HYDROFLEX', 'Dial 29', 'Variable'),
('dial-dial-30', 'HYDROFLEX', 'Dial 30', 'Variable'),
('dial-dial-31', 'HYDROFLEX', 'Dial 31', 'Variable'),
('dial-dial-32', 'HYDROFLEX', 'Dial 32', 'Variable');

-- ===========================================
-- INCH-GALLON CONVERSIONS
-- ===========================================

-- 5 Gallon Drum
INSERT INTO "InchGallonConversion" (id, "containerType", inches, gallons) VALUES
('drum-5-gal-2-5', 'DRUM_5_GAL', 2.5, 1),
('drum-5-gal-5-1', 'DRUM_5_GAL', 5.1, 2),
('drum-5-gal-7-5', 'DRUM_5_GAL', 7.5, 3),
('drum-5-gal-10-0', 'DRUM_5_GAL', 10.0, 4),
('drum-5-gal-12-6', 'DRUM_5_GAL', 12.6, 5);

-- 15 Gallon Drum
INSERT INTO "InchGallonConversion" (id, "containerType", inches, gallons) VALUES
('drum-15-gal-1-4', 'DRUM_15_GAL', 1.4, 1),
('drum-15-gal-2-9', 'DRUM_15_GAL', 2.9, 2),
('drum-15-gal-4-2', 'DRUM_15_GAL', 4.2, 3),
('drum-15-gal-5-8', 'DRUM_15_GAL', 5.8, 4),
('drum-15-gal-7-2', 'DRUM_15_GAL', 7.2, 5),
('drum-15-gal-8-6', 'DRUM_15_GAL', 8.6, 6),
('drum-15-gal-10-0', 'DRUM_15_GAL', 10.0, 7),
('drum-15-gal-11-4', 'DRUM_15_GAL', 11.4, 8),
('drum-15-gal-12-9', 'DRUM_15_GAL', 12.9, 9),
('drum-15-gal-14-3', 'DRUM_15_GAL', 14.3, 10),
('drum-15-gal-15-8', 'DRUM_15_GAL', 15.8, 11),
('drum-15-gal-17-2', 'DRUM_15_GAL', 17.2, 12),
('drum-15-gal-18-6', 'DRUM_15_GAL', 18.6, 13),
('drum-15-gal-20-0', 'DRUM_15_GAL', 20.0, 14),
('drum-15-gal-21-5', 'DRUM_15_GAL', 21.5, 15);

-- 30 Gallon Drum
INSERT INTO "InchGallonConversion" (id, "containerType", inches, gallons) VALUES
('drum-30-gal-0-8', 'DRUM_30_GAL', 0.8, 1),
('drum-30-gal-1-7', 'DRUM_30_GAL', 1.7, 2),
('drum-30-gal-2-6', 'DRUM_30_GAL', 2.6, 3),
('drum-30-gal-3-5', 'DRUM_30_GAL', 3.5, 4),
('drum-30-gal-4-3', 'DRUM_30_GAL', 4.3, 5),
('drum-30-gal-5-2', 'DRUM_30_GAL', 5.2, 6),
('drum-30-gal-6-1', 'DRUM_30_GAL', 6.1, 7),
('drum-30-gal-6-9', 'DRUM_30_GAL', 6.9, 8),
('drum-30-gal-7-8', 'DRUM_30_GAL', 7.8, 9),
('drum-30-gal-8-7', 'DRUM_30_GAL', 8.7, 10),
('drum-30-gal-9-6', 'DRUM_30_GAL', 9.6, 11),
('drum-30-gal-10-4', 'DRUM_30_GAL', 10.4, 12),
('drum-30-gal-11-3', 'DRUM_30_GAL', 11.3, 13),
('drum-30-gal-12-2', 'DRUM_30_GAL', 12.2, 14),
('drum-30-gal-13-0', 'DRUM_30_GAL', 13.0, 15),
('drum-30-gal-13-9', 'DRUM_30_GAL', 13.9, 16),
('drum-30-gal-14-8', 'DRUM_30_GAL', 14.8, 17),
('drum-30-gal-15-6', 'DRUM_30_GAL', 15.6, 18),
('drum-30-gal-16-5', 'DRUM_30_GAL', 16.5, 19),
('drum-30-gal-17-4', 'DRUM_30_GAL', 17.4, 20),
('drum-30-gal-18-2', 'DRUM_30_GAL', 18.2, 21),
('drum-30-gal-19-1', 'DRUM_30_GAL', 19.1, 22),
('drum-30-gal-20-0', 'DRUM_30_GAL', 20.0, 23),
('drum-30-gal-20-8', 'DRUM_30_GAL', 20.8, 24),
('drum-30-gal-21-7', 'DRUM_30_GAL', 21.7, 25),
('drum-30-gal-22-6', 'DRUM_30_GAL', 22.6, 26),
('drum-30-gal-23-5', 'DRUM_30_GAL', 23.5, 27),
('drum-30-gal-24-3', 'DRUM_30_GAL', 24.3, 28),
('drum-30-gal-25-1', 'DRUM_30_GAL', 25.1, 29),
('drum-30-gal-26-0', 'DRUM_30_GAL', 26.0, 30);

-- 55 Gallon Drum
INSERT INTO "InchGallonConversion" (id, "containerType", inches, gallons) VALUES
('drum-55-gal-0-6', 'DRUM_55_GAL', 0.6, 1),
('drum-55-gal-2-9', 'DRUM_55_GAL', 2.9, 5),
('drum-55-gal-5-7', 'DRUM_55_GAL', 5.7, 10),
('drum-55-gal-8-6', 'DRUM_55_GAL', 8.6, 15),
('drum-55-gal-11-4', 'DRUM_55_GAL', 11.4, 20),
('drum-55-gal-14-3', 'DRUM_55_GAL', 14.3, 25),
('drum-55-gal-17-2', 'DRUM_55_GAL', 17.2, 30),
('drum-55-gal-20-0', 'DRUM_55_GAL', 20.0, 35),
('drum-55-gal-22-9', 'DRUM_55_GAL', 22.9, 40),
('drum-55-gal-25-8', 'DRUM_55_GAL', 25.8, 45),
('drum-55-gal-28-6', 'DRUM_55_GAL', 28.6, 50),
('drum-55-gal-31-5', 'DRUM_55_GAL', 31.5, 55);
