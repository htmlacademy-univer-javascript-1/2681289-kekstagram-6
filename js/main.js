const API_BASE_URL = 'https://29.javascript.htmlacademy.pro/kekstagram';
const DATA_URL = `${API_BASE_URL}/data`;
const COMMENTS_STEP = 5;
const SCALE_STEP = 25;
const SCALE_MIN = 25;
const SCALE_MAX = 100;
const COMMENT_MAX_LENGTH = 140;
const MAX_HASHTAGS_COUNT = 5;

const body = document.body;
const uploadForm = document.querySelector('.img-upload__form');
const uploadInput = uploadForm.querySelector('.img-upload__input');
const uploadOverlay = uploadForm.querySelector('.img-upload__overlay');
const uploadCancelButton = uploadForm.querySelector('.img-upload__cancel');
const submitButton = uploadForm.querySelector('.img-upload__submit');
const hashtagInput = uploadForm.querySelector('.text__hashtags');
const descriptionInput = uploadForm.querySelector('.text__description');

const imagePreview = uploadForm.querySelector('.img-upload__preview img');
const defaultPreviewImage = imagePreview.src;
const effectPreviewItems = uploadForm.querySelectorAll('.effects__preview');
const effectLevelContainer = uploadForm.querySelector('.img-upload__effect-level');
const effectLevelSlider = effectLevelContainer.querySelector('.effect-level__slider');
const effectLevelValue = effectLevelContainer.querySelector('.effect-level__value');

const scaleControlValue = uploadForm.querySelector('.scale__control--value');
const scaleButtonSmaller = uploadForm.querySelector('.scale__control--smaller');
const scaleButtonBigger = uploadForm.querySelector('.scale__control--bigger');
ds
const effectsList = uploadForm.querySelector('.effects__list');
const effectNoneControl = uploadForm.querySelector('#effect-none');

const picturesContainer = document.querySelector('.pictures');
const pictureTemplate = document.querySelector('#picture').content.querySelector('.picture');

const filtersContainer = document.querySelector('.img-filters');
const filtersForm = filtersContainer.querySelector('.img-filters__form');

const bigPicture = document.querySelector('.big-picture');
const bigPictureCloseButton = bigPicture.querySelector('.big-picture__cancel');
const bigPictureImage = bigPicture.querySelector('.big-picture__img img');
const bigPictureLikes = bigPicture.querySelector('.likes-count');
const bigPictureCaption = bigPicture.querySelector('.social__caption');
const bigPictureCommentCount = bigPicture.querySelector('.social__comment-count');
const bigPictureComments = bigPicture.querySelector('.social__comments');
const commentsLoaderButton = bigPicture.querySelector('.comments-loader');

const EFFECTS = {
  none: null,
  chrome: {
    filterName: 'grayscale',
    min: 0,
    max: 1,
    step: 0.1,
    unit: ''
  },
  sepia: {
    filterName: 'sepia',
    min: 0,
    max: 1,
    step: 0.1,
    unit: ''
  },
  marvin: {
    filterName: 'invert',
    min: 0,
    max: 100,
    step: 1,
    unit: '%'
  },
  phobos: {
    filterName: 'blur',
    min: 0,
    max: 3,
    step: 0.1,
    unit: 'px'
  },
  heat: {
    filterName: 'brightness',
    min: 1,
    max: 3,
    step: 0.1,
    unit: ''
  }
};

let scaleValue = SCALE_MAX;
let currentEffect = 'none';
let activeUploadFileUrl = '';

let pictures = [];
let currentFilterId = 'filter-default';

let shownCommentsCount = 0;
let activeComments = [];
let ffe=0
const pristine = new Pristine(uploadForm, {
  classTo: 'img-upload__field-wrapper',
  errorTextParent: 'img-upload__field-wrapper',
  errorTextClass: 'img-upload__field-wrapper--error-text'
});

const isEscapeKey = (evt) => evt.key === 'Escape';
const lll=2
const createDebounce = (callback, timeoutDelay = 500) => {
  let timeoutId;

  return (...rest) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...rest), timeoutDelay);
  };
};
const l=334432

const fwe=2
const getHashtags = () => hashtagInput.value
  .trim()
  .split(/\s+/)
  .filter((tag) => tag.length > 0)
  .map((tag) => tag.toLowerCase());

const isValidHashtag = (tag) => /^#[a-zа-яё0-9]{1,19}$/i.test(tag);

const validateHashtagFormat = () => getHashtags().every(isValidHashtag);

const validateHashtagCount = () => getHashtags().length <= MAX_HASHTAGS_COUNT;

const validateUniqueHashtags = () => {
  const hashtags = getHashtags();
  return new Set(hashtags).size === hashtags.length;
};

const validateDescription = () => descriptionInput.value.length <= COMMENT_MAX_LENGTH;

pristine.addValidator(
  hashtagInput,
  validateHashtagFormat,
  'Хэш-тег должен начинаться с # и содержать только буквы или цифры'
);
pristine.addValidator(
  hashtagInput,
  validateHashtagCount,
  `Нельзя указать больше ${MAX_HASHTAGS_COUNT} хэш-тегов`
);
pristine.addValidator(
  hashtagInput,
  validateUniqueHashtags,
  'Хэш-теги не должны повторяться'
);
pristine.addValidator(
  descriptionInput,
  validateDescription,
  `Длина комментария не должна превышать ${COMMENT_MAX_LENGTH} символов`
);

const getSelectedEffectName = () => uploadForm.querySelector('input[name="effect"]:checked').value;

const updateImageScale = () => {
  scaleControlValue.value = `${scaleValue}%`;
  imagePreview.style.transform = `scale(${scaleValue / 100})`;
};

const resetScale = () => {
  scaleValue = SCALE_MAX;
  updateImageScale();
};

const clearImageEffect = () => {
  imagePreview.style.filter = '';
  effectLevelContainer.classList.add('hidden');
};

const applyImageEffect = (effectValue) => {
  const effectSettings = EFFECTS[currentEffect];

  if (!effectSettings) {
    clearImageEffect();
    return;
  }

  imagePreview.style.filter = `${effectSettings.filterName}(${effectValue}${effectSettings.unit})`;
};

const updateSliderByEffect = () => {
  const effectSettings = EFFECTS[currentEffect];

  if (!effectSettings) {
    clearImageEffect();
    return;
  }

  effectLevelContainer.classList.remove('hidden');
  effectLevelSlider.noUiSlider.updateOptions({
    range: {
      min: effectSettings.min,
      max: effectSettings.max
    },
    step: effectSettings.step,
    start: effectSettings.max
  });
  effectLevelSlider.noUiSlider.set(effectSettings.max);
};

const resetEffects = () => {
  currentEffect = 'none';
  effectNoneControl.checked = true;
  updateSliderByEffect();
};

const revokeCurrentUploadFileUrl = () => {
  if (activeUploadFileUrl) {
    URL.revokeObjectURL(activeUploadFileUrl);
    activeUploadFileUrl = '';
  }
};

const setUploadPreviewImage = () => {
  const selectedFile = uploadInput.files[0];

  if (!selectedFile || !selectedFile.type.startsWith('image/')) {
    return false;
  }

  revokeCurrentUploadFileUrl();
  activeUploadFileUrl = URL.createObjectURL(selectedFile);
  imagePreview.src = activeUploadFileUrl;
  effectPreviewItems.forEach((preview) => {
    preview.style.backgroundImage = `url("${activeUploadFileUrl}")`;
  });
  return true;
};

const resetUploadPreviewImage = () => {
  imagePreview.src = defaultPreviewImage;
  effectPreviewItems.forEach((preview) => {
    preview.style.backgroundImage = '';
  });
  revokeCurrentUploadFileUrl();
};

const resetUploadForm = () => {
  uploadForm.reset();
  pristine.reset();
  resetScale();
  resetEffects();
  resetUploadPreviewImage();
};

const openUploadModal = () => {
  uploadOverlay.classList.remove('hidden');
  body.classList.add('modal-open');
};

const closeUploadModal = () => {
  uploadOverlay.classList.add('hidden');
  body.classList.remove('modal-open');
  resetUploadForm();
};

const onUploadModalEscapeKeydown = (evt) => {
  if (!isEscapeKey(evt)) {
    return;
  }

  if (uploadOverlay.classList.contains('hidden')) {
    return;
  }

  if (document.querySelector('.error, .success')) {
    return;
  }

  if (document.activeElement === hashtagInput || document.activeElement === descriptionInput) {
    return;
  }

  evt.preventDefault();
  closeUploadModal();
};

const createCommentElement = ({avatar, message, name}) => {
  const commentElement = document.createElement('li');
  commentElement.classList.add('social__comment');

  const commentImage = document.createElement('img');
  commentImage.classList.add('social__picture');
  commentImage.src = avatar;
  commentImage.alt = name;
  commentImage.width = 35;
  commentImage.height = 35;

  const commentText = document.createElement('p');
  commentText.classList.add('social__text');
  commentText.textContent = message;

  commentElement.append(commentImage, commentText);

  return commentElement;
};

const updateCommentCount = () => {
  const totalCount = activeComments.length;
  bigPictureCommentCount.innerHTML = `${shownCommentsCount} из <span class="comments-count">${totalCount}</span> комментариев`;
};

const renderNextComments = () => {
  const nextComments = activeComments.slice(shownCommentsCount, shownCommentsCount + COMMENTS_STEP);
  const commentsFragment = document.createDocumentFragment();

  nextComments.forEach((comment) => {
    commentsFragment.append(createCommentElement(comment));
  });

  bigPictureComments.append(commentsFragment);
  shownCommentsCount += nextComments.length;

  updateCommentCount();
  commentsLoaderButton.classList.toggle('hidden', shownCommentsCount >= activeComments.length);
};

const onBigPictureEscKeydown = (evt) => {
  if (!isEscapeKey(evt)) {
    return;
  }

  evt.preventDefault();
  closeBigPicture();
};

function openBigPicture(picture) {
  bigPictureImage.src = picture.url;
  bigPictureLikes.textContent = picture.likes;
  bigPictureCaption.textContent = picture.description;

  activeComments = picture.comments;
  shownCommentsCount = 0;
  bigPictureComments.innerHTML = '';
  renderNextComments();

  bigPicture.classList.remove('hidden');
  body.classList.add('modal-open');
  document.addEventListener('keydown', onBigPictureEscKeydown);
}

function closeBigPicture() {
  bigPicture.classList.add('hidden');
  body.classList.remove('modal-open');
  document.removeEventListener('keydown', onBigPictureEscKeydown);
}

const removeRenderedPictures = () => {
  picturesContainer.querySelectorAll('.picture').forEach((picture) => picture.remove());
};

const createPictureElement = ({id, url, comments, likes}) => {
  const pictureElement = pictureTemplate.cloneNode(true);
  const previewImage = pictureElement.querySelector('.picture__img');

  pictureElement.dataset.pictureId = String(id);
  previewImage.src = url;
  previewImage.alt = 'Фотография пользователя';
  pictureElement.querySelector('.picture__comments').textContent = comments.length;
  pictureElement.querySelector('.picture__likes').textContent = likes;

  return pictureElement;
};

const renderPictures = (picturesData) => {
  removeRenderedPictures();
  const picturesFragment = document.createDocumentFragment();

  picturesData.forEach((picture) => {
    picturesFragment.append(createPictureElement(picture));
  });

  picturesContainer.append(picturesFragment);
};

const getRandomPictures = (picturesData, count) => {
  const shuffledPictures = [...picturesData];

  for (let i = shuffledPictures.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffledPictures[i], shuffledPictures[randomIndex]] = [shuffledPictures[randomIndex], shuffledPictures[i]];
  }

  return shuffledPictures.slice(0, count);
};

const getFilteredPictures = () => {
  switch (currentFilterId) {
    case 'filter-random':
      return getRandomPictures(pictures, 10);
    case 'filter-discussed':
      return [...pictures].sort((firstPicture, secondPicture) => secondPicture.comments.length - firstPicture.comments.length);
    case 'filter-default':
    default:
      return [...pictures];
  }
};

const debouncedRenderPictures = createDebounce((picturesData) => {
  renderPictures(picturesData);
});

const updateActiveFilterButton = (buttonElement) => {
  const activeButton = filtersForm.querySelector('.img-filters__button--active');

  if (activeButton) {
    activeButton.classList.remove('img-filters__button--active');
  }

  buttonElement.classList.add('img-filters__button--active');
};

const showDataLoadingError = () => {
  const errorElement = document.createElement('div');
  errorElement.textContent = 'Не удалось загрузить фотографии. Попробуйте обновить страницу.';
  errorElement.style.position = 'fixed';
  errorElement.style.top = '0';
  errorElement.style.left = '0';
  errorElement.style.right = '0';
  errorElement.style.zIndex = '1000';
  errorElement.style.padding = '14px 20px';
  errorElement.style.textAlign = 'center';
  errorElement.style.fontSize = '18px';
  errorElement.style.color = '#ffffff';
  errorElement.style.backgroundColor = '#cc0000';
  body.append(errorElement);
};

const showSubmitMessage = (messageType) => {
  const template = document.querySelector(`#${messageType}`).content.querySelector(`.${messageType}`);
  const messageElement = template.cloneNode(true);
  const inner = messageElement.querySelector(`.${messageType}__inner`);
  const closeButton = messageElement.querySelector(`.${messageType}__button`);

  const closeMessage = () => {
    messageElement.remove();
    document.removeEventListener('keydown', onMessageEscKeydown);
  };

  function onMessageEscKeydown(evt) {
    if (!isEscapeKey(evt)) {
      return;
    }

    evt.preventDefault();
    closeMessage();
  }

  const onMessageClick = (evt) => {
    if (evt.target === messageElement || !inner.contains(evt.target)) {
      closeMessage();
    }
  };

  closeButton.addEventListener('click', closeMessage);
  messageElement.addEventListener('click', onMessageClick);
  document.addEventListener('keydown', onMessageEscKeydown);

  body.append(messageElement);
};

const setSubmitButtonDisabled = (isDisabled) => {
  submitButton.disabled = isDisabled;
};

const sendPicture = async (formData) => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Не удалось отправить форму');
  }
};

const loadPictures = async () => {
  const response = await fetch(DATA_URL);

  if (!response.ok) {
    throw new Error('Не удалось загрузить данные');
  }

  return response.json();
};

const onUploadFormSubmit = async (evt) => {
  evt.preventDefault();

  const isValid = pristine.validate();
  if (!isValid) {
    return;
  }

  setSubmitButtonDisabled(true);

  try {
    await sendPicture(new FormData(uploadForm));
    closeUploadModal();
    showSubmitMessage('success');
  } catch (error) {
    showSubmitMessage('error');
  } finally {
    setSubmitButtonDisabled(false);
  }
};

const initSlider = () => {
  noUiSlider.create(effectLevelSlider, {
    range: {
      min: 0,
      max: 1
    },
    start: 1,
    step: 0.1,
    connect: 'lower'
  });

  effectLevelSlider.noUiSlider.on('update', () => {
    const sliderValue = effectLevelSlider.noUiSlider.get();
    effectLevelValue.value = sliderValue;
    applyImageEffect(sliderValue);
  });

  resetEffects();
};

const onUploadInputChange = () => {
  const hasImage = setUploadPreviewImage();

  if (!hasImage) {
    return;
  }

  openUploadModal();
};

const onScaleButtonSmallerClick = () => {
  scaleValue = Math.max(scaleValue - SCALE_STEP, SCALE_MIN);
  updateImageScale();
};

const onScaleButtonBiggerClick = () => {
  scaleValue = Math.min(scaleValue + SCALE_STEP, SCALE_MAX);
  updateImageScale();
};

const onEffectsListChange = (evt) => {
  if (evt.target.name !== 'effect') {
    return;
  }

  currentEffect = getSelectedEffectName();
  updateSliderByEffect();
};

const onPicturesContainerClick = (evt) => {
  const pictureElement = evt.target.closest('.picture');

  if (!pictureElement) {
    return;
  }

  evt.preventDefault();

  const selectedPictureId = Number(pictureElement.dataset.pictureId);
  const selectedPicture = pictures.find((picture) => picture.id === selectedPictureId);

  if (!selectedPicture) {
    return;
  }

  openBigPicture(selectedPicture);
};

const onFiltersFormClick = (evt) => {
  const filterButton = evt.target.closest('.img-filters__button');

  if (!filterButton || currentFilterId === filterButton.id) {
    return;
  }

  currentFilterId = filterButton.id;
  updateActiveFilterButton(filterButton);
  debouncedRenderPictures(getFilteredPictures());
};

const initUploadForm = () => {
  initSlider();
  resetScale();

  uploadInput.addEventListener('change', onUploadInputChange);
  uploadCancelButton.addEventListener('click', closeUploadModal);
  scaleButtonSmaller.addEventListener('click', onScaleButtonSmallerClick);
  scaleButtonBigger.addEventListener('click', onScaleButtonBiggerClick);
  effectsList.addEventListener('change', onEffectsListChange);
  uploadForm.addEventListener('submit', onUploadFormSubmit);
  document.addEventListener('keydown', onUploadModalEscapeKeydown);
};

const initBigPicture = () => {
  bigPictureCloseButton.addEventListener('click', closeBigPicture);
  commentsLoaderButton.addEventListener('click', renderNextComments);
  picturesContainer.addEventListener('click', onPicturesContainerClick);
};

const initFilters = () => {
  filtersForm.addEventListener('click', onFiltersFormClick);
};

const initPage = async () => {
  initUploadForm();
  initBigPicture();
  initFilters();

  try {
    pictures = await loadPictures();
    filtersContainer.classList.remove('img-filters--inactive');
    renderPictures(getFilteredPictures());
  } catch (error) {
    showDataLoadingError();
  }
};

initPage();
