% Q1: Take 3 sets of 2 photographs to be stitched together to create a panorama
S1_im1 = im2double(imresize(imread('S1-im1.png'), [750, 480]));
S1_im2 = im2double(imresize(imread('S1-im2.png'), [750, 480]));
S2_im1 = im2double(imresize(imread('S2-im1.png'), [750, 480]));
S2_im2 = im2double(imresize(imread('S2-im2.png'), [750, 480]));
S3_im1 = im2double(imresize(imread('S3-im1.png'), [750, 480]));
S3_im2 = im2double(imresize(imread('S3-im2.png'), [750, 480]));
S3_im3 = im2double(imresize(imread('S3-im3.png'), [750, 480]));
S3_im4 = im2double(imresize(imread('S3-im4.png'), [750, 480]));
S4_im1 = im2double(imresize(imread('S4-im1.png'), [750, 480]));
S4_im2 = im2double(imresize(imread('S4-im2.png'), [750, 480]));
S4_im3 = im2double(imresize(imread('S4-im3.png'), [750, 480]));
S4_im4 = im2double(imresize(imread('S4-im4.png'), [750, 480]));


%%

% Q2: FAST feature detector (3 pts.)
function feature_points = my_fast_detector(input_image, threshold, numOfPass)
    input_image_grey = rgb2gray(input_image);
    [rows, cols] = size(input_image_grey);
    padded_img = zeros(rows + 6, cols + 6);
    padded_img(4:rows+3, 4:cols+3) = input_image_grey;
    feature_points = zeros(rows, cols);
    offsets = [-3,  0; -3,  1; -2,  2; -1,  3;  0,  3;  1,  3;  2,  2;  3,  1; 
               3,  0;  3, -1;  2, -2;  1, -3;  0, -3; -1, -3; -2, -2; -3, -1];
    for r = 1:rows
        for c = 1:cols
            pass_count = 0;
            central_pixel = padded_img(r+3, c+3);
            for i = 1:size(offsets, 1)
                neighbor_pixel = padded_img(r+3+offsets(i, 1), c+3+offsets(i, 2));
                if abs(central_pixel - neighbor_pixel) > threshold
                    pass_count = pass_count + 1;
                end
            end
            if pass_count > numOfPass
                feature_points(r, c) = 1;
            end
        end
    end
end

S1_fast = S1_im1 + my_fast_detector(S1_im1, 0.15, 12);
imwrite(S1_fast, 'S1-fast.png');
S2_fast = S2_im1 + my_fast_detector(S2_im1, 0.25, 12);
imwrite(S2_fast, 'S2-fast.png');

%%


% Q2: Robust FAST using Harris Cornerness metric (1 pts.)
function feature_points_R = my_harris_detector(input_image, fast_threshold, numOfPass, harris_threshold)
    feature_points_R = my_fast_detector(input_image, fast_threshold, numOfPass);
    input_image_grey = rgb2gray(input_image);
    [rows, cols] = size(input_image_grey);
    sobel = [-1 0 1; -2 0 2; -1 0 1];
    gaus = fspecial('gaussian', 5, 1);
    dog = conv2(gaus, sobel);
    Ix = imfilter(input_image_grey, dog); 
    Iy = imfilter(input_image_grey, dog');
    Ixx = imfilter(Ix .* Ix, gaus);  
    Iyy = imfilter(Iy .* Iy, gaus);  
    Ixy = imfilter(Ix .* Iy, gaus);  
    harris_response = zeros(rows, cols);
    for r = 1:rows
        for c = 1:cols
            M = [Ixx(r, c), Ixy(r, c); Ixy(r, c), Iyy(r, c)];
            harris_response(r, c) = det(M) - 0.05 * (trace(M)^2);
        end
    end

    harris_response = harris_response .* feature_points_R;  
    feature_points_R = harris_response > harris_threshold; 
end

S1_fastR_points = S1_im1 + my_harris_detector(S1_im1, 0.15, 12, 0.001);
imwrite(S1_fastR_points, 'S1-fastR.png');
S2_fastR_points = S2_im1 + my_harris_detector(S2_im1, 0.25, 12, 0.001);
imwrite(S2_fastR_points, 'S2-fastR.png');

% % Note down the average computing time
% tic; 
% S1_fast1 = my_fast_detector(S1_im1, 0.08, 12); S1_fast2 = my_fast_detector(S1_im2, 0.08, 12);
% S2_fast1 = my_fast_detector(S2_im1, 0.08, 12); S2_fast2 = my_fast_detector(S2_im2, 0.08, 12);
% S3_fast1 = my_fast_detector(S3_im1, 0.08, 12); S3_fast2 = my_fast_detector(S3_im2, 0.08, 12);
% S4_fast1 = my_fast_detector(S4_im1, 0.08, 12); S4_fast2 = my_fast_detector(S4_im2, 0.08, 12);
% fast_time = toc;
% 
% tic;
% S1_fastR1 = my_harris_detector(S1_im1, 0.08, 12, 0.01); S1_fastR2 = my_harris_detector(S1_im2, 0.08, 12, 0.01);
% S2_fastR1 = my_harris_detector(S2_im1, 0.08, 12, 0.01); S2_fastR2 = my_harris_detector(S2_im2, 0.08, 12, 0.01);
% S3_fastR1 = my_harris_detector(S3_im1, 0.08, 12, 0.01); S3_fastR2 = my_harris_detector(S3_im2, 0.08, 12, 0.01);
% S4_fastR1 = my_harris_detector(S4_im1, 0.08, 12, 0.01); S4_fastR2 = my_harris_detector(S4_im2, 0.08, 12, 0.01);
% harris_time = toc;
% 
% avg_fast_time = fast_time / 8;
% avg_harris_time = harris_time / 8;
% fprintf('Average computation time for FAST: %.4f seconds\n', avg_fast_time);
% fprintf('Average computation time for FASTR: %.4f seconds\n', avg_harris_time);

%%

% Q3: Point description and matching (2 pts.)
function [matchedPts1, matchedPts2, matched_image] = my_fast_matching(image1, image2, fast_threshold, numOfPass)
    image1_grey = rgb2gray(image1);
    image2_grey = rgb2gray(image2);
    fast_points1 = my_fast_detector(image1, fast_threshold, numOfPass);
    fast_points2 = my_fast_detector(image2, fast_threshold, numOfPass);
    [y1, x1] = find(fast_points1);
    [y2, x2] = find(fast_points2);
    pts1 = cornerPoints([x1, y1]);
    pts2 = cornerPoints([x2, y2]);
    [features1, filtered_pts1] = extractFeatures(image1_grey, pts1, "Method", "SURF");
    [features2, filtered_pts2] = extractFeatures(image2_grey, pts2, "Method", "SURF");
    indexPairs = matchFeatures(features1, features2);
    matchedPts1 = filtered_pts1(indexPairs(:, 1), :);
    matchedPts2 = filtered_pts2(indexPairs(:, 2), :);

    figure;
    showMatchedFeatures(image1, image2, matchedPts1, matchedPts2, 'montage');
    axis tight;
    set(gca, 'Position', [0 0 1 1]);
    frame = getframe(gca);
    matched_image = frame.cdata;
end

function [matchedPts1, matchedPts2, matched_image] = my_fastR_matching(image1, image2, fast_threshold, numOfPass, harris_threshold)
    image1_grey = rgb2gray(image1);
    image2_grey = rgb2gray(image2);
    fastr_points1 = my_harris_detector(image1, fast_threshold, numOfPass, harris_threshold);
    fastr_points2 = my_harris_detector(image2, fast_threshold, numOfPass, harris_threshold);
    [y1, x1] = find(fastr_points1);
    [y2, x2] = find(fastr_points2);
    pts1 = cornerPoints([x1, y1]);
    pts2 = cornerPoints([x2, y2]);
    [features1, filtered_pts1] = extractFeatures(image1_grey, pts1, "Method", "SURF");
    [features2, filtered_pts2] = extractFeatures(image2_grey, pts2, "Method", "SURF");
    indexPairs = matchFeatures(features1, features2);
    matchedPts1 = filtered_pts1(indexPairs(:, 1), :);
    matchedPts2 = filtered_pts2(indexPairs(:, 2), :);

    figure;
    showMatchedFeatures(image1, image2, matchedPts1, matchedPts2, 'montage');
    axis tight;
    set(gca, 'Position', [0 0 1 1]);
    frame = getframe(gca);
    matched_image = frame.cdata;
end

[p1, p2, S1_fastMatch] = my_fast_matching(S1_im1, S1_im2, 0.15, 12);
imwrite(S1_fastMatch, 'S1-fastMatch.png');
[p1, p2, S1_fastRMatch] = my_fastR_matching(S1_im1, S1_im2, 0.25, 12, 0.001);
imwrite(S1_fastRMatch, 'S1-fastRMatch.png');
[p1, p2, S2_fastMatch] = my_fast_matching(S2_im1, S2_im2, 0.25, 12);
imwrite(S2_fastMatch, 'S2-fastMatch.png');
[p1, p2, S2_fastRMatch] = my_fastR_matching(S2_im1, S2_im2, 0.25, 12, 0.001);
imwrite(S2_fastRMatch, 'S2-fastRMatch.png');

%%

% Q4: RANSAC and Panoramas (4 pts.)
function panorama = create_multi_image_panorama_fastR(imageList, fast_threshold, numOfPass, harris_threshold, conf, numOfTrials)
    numImages = numel(imageList);
    tforms(numImages) = projtform2d;  
    imageSize = zeros(numImages, 2);  
    im1 = imageList{1};
    imageSize(1, :) = size(im1, 1:2);

    for n = 2:numImages
        I = imageList{n};
        grayImage = im2gray(I);    
        imageSize(n, :) = size(grayImage);
        [matchedPts1, matchedPts2] = my_fastR_matching(imageList{n-1}, I, fast_threshold, numOfPass, harris_threshold);
        tforms(n) = estgeotform2d(matchedPts2, matchedPts1, ...
                                  "projective", "Confidence", conf, "MaxNumTrials", numOfTrials);
        tforms(n).A = tforms(n-1).A * tforms(n).A; 
    end

    [tforms, xlim, ylim] = adjustTransformations(tforms, imageSize);
    [panorama, panoramaView] = initializePanorama(imageSize, xlim, ylim, I);
    for idx = 1:numImages
        I = imageList{idx};   
        warpedImage = imwarp(I, tforms(idx), 'OutputView', panoramaView);                 
        mask = imwarp(true(size(I, 1), size(I, 2)), tforms(idx), 'OutputView', panoramaView);
        panorama = imblend(warpedImage, panorama, mask, 'ForegroundOpacity', 1);
    end
end

function [tforms, xlim, ylim] = adjustTransformations(tforms, imageSize)
    numImages = numel(tforms);
    xlim = zeros(numImages, 2);
    ylim = zeros(numImages, 2);
    
    for idx = 1:numImages           
        [xlim(idx,:), ylim(idx,:)] = outputLimits(tforms(idx), [1 imageSize(idx, 2)], [1 imageSize(idx, 1)]);
    end
    avgXLim = mean(xlim, 2);
    [~, idx] = sort(avgXLim);
    centerIdx = floor((numImages + 1) / 2);
    centerImageIdx = idx(centerIdx);
    Tinv = invert(tforms(centerImageIdx));
    for idx = 1:numImages    
        tforms(idx).A = Tinv.A * tforms(idx).A;
    end
    for idx = 1:numImages           
        [xlim(idx,:), ylim(idx,:)] = outputLimits(tforms(idx), [1 imageSize(idx, 2)], [1 imageSize(idx, 1)]);
    end
end

function [panorama, panoramaView] = initializePanorama(imageSize, xlim, ylim, referenceImage)
    maxImageSize = max(imageSize);
    xMin = min([1; xlim(:)]);
    xMax = max([maxImageSize(2); xlim(:)]);
    yMin = min([1; ylim(:)]);
    yMax = max([maxImageSize(1); ylim(:)]);
    width = round(xMax - xMin);
    height = round(yMax - yMin);
    panorama = zeros([height, width, 3], 'like', referenceImage);
    xLimits = [xMin, xMax];
    yLimits = [yMin, yMax];
    panoramaView = imref2d([height, width], xLimits, yLimits);
end


S1_panorama = create_multi_image_panorama_fastR({S1_im1, S1_im2}, 0.15, 12, 0.001, 99.9, 2500);
imwrite(S1_panorama, 'S1-panorama.png');
S2_panorama = create_multi_image_panorama_fastR({S2_im1, S2_im2}, 0.25, 12, 0.001, 99.9, 2500);
imwrite(S2_panorama, 'S2-panorama.png');


%%

% Test panorama use fast and fastr with different RANSAC parameters (In Q4)
function panorama = create_multi_image_panorama_fast(imageList, fast_threshold, numOfPass, conf, numOfTrials)
    numImages = numel(imageList);
    tforms(numImages) = projtform2d;
    imageSize = zeros(numImages, 2); 
    im1 = imageList{1};
    imageSize(1, :) = size(im1, 1:2);
    for n = 2:numImages
        I = imageList{n};
        grayImage = im2gray(I);    
        imageSize(n, :) = size(grayImage); 
        [matchedPts1, matchedPts2] = my_fast_matching(imageList{n-1}, I, fast_threshold, numOfPass);
        tforms(n) = estgeotform2d(matchedPts2, matchedPts1, ...
            "projective", "Confidence", conf, "MaxNumTrials", numOfTrials);
        tforms(n).A = tforms(n-1).A * tforms(n).A; 
    end
    for idx = 1:numel(tforms)           
        [xlim(idx,:), ylim(idx,:)] = outputLimits(tforms(idx), [1 imageSize(idx, 2)], [1 imageSize(idx, 1)]);    
    end
    avgXLim = mean(xlim, 2);
    [~, idx] = sort(avgXLim);
    centerIdx = floor((numel(tforms) + 1) / 2);
    centerImageIdx = idx(centerIdx);
    Tinv = invert(tforms(centerImageIdx));
    for idx = 1:numel(tforms)    
        tforms(idx).A = Tinv.A * tforms(idx).A;
    end
    for idx = 1:numel(tforms)           
        [xlim(idx,:), ylim(idx,:)] = outputLimits(tforms(idx), [1 imageSize(idx, 2)], [1 imageSize(idx, 1)]);
    end
    maxImageSize = max(imageSize);
    xMin = min([1; xlim(:)]);
    xMax = max([maxImageSize(2); xlim(:)]);
    yMin = min([1; ylim(:)]);
    yMax = max([maxImageSize(1); ylim(:)]);
    width = round(xMax - xMin);
    height = round(yMax - yMin);
    panorama = zeros([height, width, 3], 'like', I);
    xLimits = [xMin, xMax];
    yLimits = [yMin, yMax];
    panoramaView = imref2d([height, width], xLimits, yLimits);
    for idx = 1:numImages
        I = imageList{idx};   
        warpedImage = imwarp(I, tforms(idx), 'OutputView', panoramaView);                 
        mask = imwarp(true(size(I, 1), size(I, 2)), tforms(idx), 'OutputView', panoramaView);
        panorama = imblend(warpedImage, panorama, mask, 'ForegroundOpacity', 1);
    end
end

% Test cases for parameters
% S1_panorama_fastR = create_multi_image_panorama_fastR({S1_im1, S1_im2}, 0.2, 12, 0.001, 99.9, 2000);
% S1_panorama_fast = create_multi_image_panorama_fast({S1_im1, S1_im2}, 0.2, 12, 99.9, 3500);
% S2_panorama_fastR = create_multi_image_panorama_fastR({S2_im1, S2_im2}, 0.2, 12, 0.001, 99.9, 2000);
% S2_panorama_fast = create_multi_image_panorama_fast({S2_im1, S2_im2}, 0.2, 12, 99.9, 3500);
% S1_panorama_fastR = imresize(S1_panorama_fastR, [750,480]);
% S1_panorama_fast = imresize(S1_panorama_fast, [750,480]);
% S2_panorama_fastR = imresize(S2_panorama_fastR, [750,480]); 
% S2_panorama_fast = imresize(S2_panorama_fast, [750,480]);
% imshow([S1_panorama_fastR, S1_panorama_fast; S2_panorama_fastR, S2_panorama_fast]);


%%

% Q5: Stitch 4 images instead of 2. (2 pts.)
S3_panorama = create_multi_image_panorama_fastR({S3_im1, S3_im2, S3_im3, S3_im4}, 0.4, 12, 0.001, 99.9, 2500);
imwrite(S3_panorama, 'S3-panorama.png');
S4_panorama = create_multi_image_panorama_fastR({S4_im1, S4_im2, S4_im3, S4_im4}, 0.3, 12, 0.001, 99.9, 2500);
imwrite(S4_panorama, 'S4-panorama.png');

%%