import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { Icon } from '@iconify/react';
import closeFill from '@iconify/icons-eva/close-fill';
import { useState, useCallback, useEffect } from 'react';
// material
import {
  Autocomplete,
  Button,
  Dialog,
  FormControlLabel,
  Grid,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  Radio,
  Stack,
  Typography
} from '@material-ui/core';
// from validation
import * as Yup from 'yup';
import { Form, FormikProvider, useFormik } from 'formik';
// redux
import { useSelector, useDispatch } from 'react-redux';
import { createCategory, updateCategory } from '../../../redux/slices/categorySlice';
// hooks
import useLocales from '../../../hooks/useLocales';
// components
import { MRadio, MIconButton, MLabelTypo } from '../../../components/@material-extend';
import { UploadSingleFile } from '../../../components/upload';
import { varFadeInUp, MotionInView } from '../../../components/animate';
import LoadingScreen from '../../../components/LoadingScreen';
import { allowImageMineTypes } from '../../../constants/imageMineTypes';
import { firebaseUploadSingle } from '../../../helper/firebaseHelper';

// ----------------------------------------------------------------------

CategoryForm.propTypes = {
  currentId: PropTypes.any.isRequired,
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function CategoryForm({ currentId, open, setOpen }) {
  const { t } = useLocales();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const { list: categoriesList, isLoading } = useSelector((state) => state.category);
  const category = categoriesList.find((c) => c._id === currentId);
  const [categoryData, setCategoryData] = useState({ name: '', desc: '', isHide: false, parent: '', image: '' });
  const [uploadImage, setUploadImage] = useState(null);
  const [uploadPercent, setUploadPercent] = useState(-1);

  const orderList = categoriesList.map((c) => c.order);

  useEffect(() => {
    if (category) {
      setCategoryData({ ...categoryData, ...category });
      if (category.image) {
        setUploadImage(category.image);
      }
    } else {
      setCategoryData({ name: '', desc: '', isHide: false, parent: '', image: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const handleChangeOrder = (e, newValue) => {
    setCategoryData({ ...categoryData, order: newValue });
  };

  const handleDropSingleFile = useCallback((acceptedFiles) => {
    const uploadFile = acceptedFiles[0];
    if (uploadFile) {
      if (allowImageMineTypes.indexOf(uploadFile.type) < 0) {
        enqueueSnackbar(t('common.invalid-file-type'), {
          variant: 'error',
          action: (key) => (
            <MIconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </MIconButton>
          )
        });
        return;
      }
      uploadFile.preview = URL.createObjectURL(uploadFile);
      setUploadImage(uploadFile);
    }
  }, []);

  const handleSave = () => {
    if (categoryData.parent === '') {
      delete categoryData.parent;
    }
    if (!uploadImage || typeof uploadImage === 'string') {
      if (typeof uploadImage === 'string') {
        categoryData.image = uploadImage;
        setCategoryData(categoryData);
      }
      if (currentId) {
        dispatch(updateCategory(currentId, categoryData));
      } else {
        dispatch(createCategory(categoryData));
      }
      handleClose();
      return;
    }

    firebaseUploadSingle(
      uploadImage,
      'categories',
      setUploadPercent,
      (error) => {
        enqueueSnackbar(error, {
          variant: 'error',
          action: (key) => (
            <MIconButton size="small" onClick={() => closeSnackbar(key)}>
              <Icon icon={closeFill} />
            </MIconButton>
          )
        });
      },
      (url) => {
        // setCategoryData({ ...categoryData, image: url }); this way not effect
        categoryData.image = url;
        setCategoryData(categoryData);
        if (currentId) {
          dispatch(updateCategory(currentId, categoryData));
        } else {
          dispatch(createCategory(categoryData));
        }
        handleClose();
      }
    );
  };

  const handleClose = () => {
    setOpen(false);
  };

  let CategorySchema = Yup.object().shape({
    name: Yup.string()
      .trim()
      .required(t('dashboard.categories.name-validation'))
      .min(6, t('dashboard.categories.name-validation-len'))
      .max(25, t('dashboard.categories.name-validation-len'))
    // desc: Yup.string().required(t('dashboard.categories.desc-validation'))
  });
  if (currentId) {
    CategorySchema = Yup.object().shape({
      name: Yup.string()
        .trim()
        .required(t('dashboard.categories.name-validation'))
        .min(6, t('dashboard.categories.name-validation-len'))
        .max(25, t('dashboard.categories.name-validation-len')),
      order: Yup.number().required(t('dashboard.categories.order-validation'))
    });
  }

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: categoryData?.name || '',
      desc: categoryData?.desc || '',
      order: categoryData.order || ''
    },
    validationSchema: CategorySchema,
    onSubmit: async () => {
      try {
        handleSave();
      } catch (error) {
        enqueueSnackbar('Error', { variant: 'error' });
      }
    }
  });
  const { errors, touched, handleSubmit, getFieldProps } = formik;

  return (
    <Dialog disableEscapeKeyDown onBackdropClick="false" open={open} onClose={handleClose}>
      <DialogTitle>
        <Typography variant="h4" marginBottom={2} sx={{ textTransform: 'uppercase' }}>
          {currentId ? t('dashboard.categories.edit') : t('dashboard.categories.add-title')}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <FormikProvider value={formik}>
          <Form>
            {isLoading ? (
              <LoadingScreen />
            ) : (
              <Stack spacing={3}>
                {currentId && (
                  <MotionInView variants={varFadeInUp}>
                    <Autocomplete
                      defaultValue={orderList[0]}
                      fullWidth
                      options={orderList}
                      value={categoryData.order}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t('common.order')}
                          margin="none"
                          error={Boolean(touched.order && errors.order)}
                          helperText={touched.order && errors.order}
                        />
                      )}
                      onChange={handleChangeOrder}
                    />
                  </MotionInView>
                )}

                <MotionInView variants={varFadeInUp}>
                  <TextField
                    fullWidth
                    inputProps={{ minLength: 6, maxLength: 25 }}
                    label={t('dashboard.categories.name')}
                    {...getFieldProps('name')}
                    error={Boolean(touched.name && errors.name)}
                    helperText={touched.name && errors.name}
                    onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                  />
                </MotionInView>

                <MotionInView variants={varFadeInUp}>
                  <TextField
                    fullWidth
                    label={t('dashboard.categories.desc')}
                    multiline
                    rows={3}
                    {...getFieldProps('desc')}
                    error={Boolean(touched.desc && errors.desc)}
                    helperText={touched.desc && errors.desc}
                    onChange={(e) => setCategoryData({ ...categoryData, desc: e.target.value })}
                  />
                </MotionInView>

                {/* <MotionInView variants={varFadeInUp}>
                  <Autocomplete
                    fullWidth
                    options={categoriesList.filter((x) => !x.isHide && x._id !== currentId)}
                    getOptionLabel={(option) => option.name}
                    value={categoriesList.find((c) => c.slug === categoryData.parent)}
                    onChange={(e, newValue) => setCategoryData({ ...categoryData, parent: newValue._id })}
                    renderInput={(params) => (
                      <TextField {...params} label={t('dashboard.categories.parent')} margin="none" />
                    )}
                  />
                </MotionInView> */}

                <MotionInView variants={varFadeInUp}>
                  <Grid>
                    <MLabelTypo text={t('dashboard.categories.status')} />
                    <RadioGroup
                      row
                      value={categoryData.isHide.toString()}
                      onChange={(e) => setCategoryData({ ...categoryData, isHide: e.target.value === 'true' })}
                    >
                      <FormControlLabel
                        value="false"
                        control={<MRadio color="success" />}
                        label={t('dashboard.categories.visible')}
                      />
                      <FormControlLabel
                        value="true"
                        control={<Radio color="default" />}
                        label={t('dashboard.categories.hidden')}
                      />
                    </RadioGroup>
                  </Grid>
                </MotionInView>

                <MotionInView variants={varFadeInUp}>
                  <UploadSingleFile
                    label={t('dashboard.categories.image')}
                    file={uploadImage}
                    setFile={setUploadImage}
                    onDrop={handleDropSingleFile}
                    uploadPercent={uploadPercent}
                    accepted="image/*"
                  />
                </MotionInView>
              </Stack>
            )}
          </Form>
        </FormikProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit" disabled={isLoading || uploadPercent > -1}>
          {t('common.cancel')}
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isLoading || uploadPercent > -1}>
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
