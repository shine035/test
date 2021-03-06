import React, { useEffect, useState } from 'react'
import { useHistory, useParams, Link } from 'react-router-dom'
import { Breadcrumb, Form, Input, Col, Row, Select, DatePicker, Radio, Button, Spin, Space, InputNumber } from 'antd'
import { useToast } from '@chakra-ui/toast'
import moment from 'moment'
import { useSelector } from 'react-redux'

// API Service
import PhotoService from 'src/api/PhotoService'
import GalleryService from 'src/api/GalleryService'
import FileService from 'src/api/FileService'

// Components
import { ModalDeleteDocument } from 'src/components/Modals/component/ModalDeleteDocument'
import UploadFile from 'src/components/UploadFile'

// Function Helpers
import { isObjectGuidDefault } from 'src/helpers/ObjectGuid'
import { getActiveLinkByPathName } from 'src/helpers/string'
import { localeVN, dateFormat } from 'src/helpers/FomatDateTime'

// Styled Component
import SuggestSearchArchivesNumber from './SuggestSearchArchivesNumber'
import { BreadcrumbWrapper, AddDocumentWrapper, FormAddDocumentWrapper, BoxWrapper } from '../styled/AddDocumentWrapper'

const { Option } = Select
const { TextArea } = Input

const initialValues = {
  ObjectGuid: '00000000-0000-0000-0000-000000000000',
  EventName: '',
  ImageTitle: '',
  ArchivesNumber: '',
  PhotoGearNo: 0,
  PhotoPocketNo: 0,
  PhotoNo: 0,
  FilmGearNo: 0,
  FilmPocketNo: 0,
  FilmNo: 0,
  Photographer: '',
  PhotoTime: '',
  PhotoPlace: '',
  FilmSize: '',
  DeliveryUnit: '',
  DeliveryDate: '',
  InforSign: '',
  Description: '',
  Format: 1,
  SecurityLevel: 1,
  PhotoStatus: 2,
  Mode: 2,
  Colour: 1,
  StorageTimeType: 2,
  Maintenance: '',
  PhotoType: 1,
  Form: 1,
  GalleryNationalAssembly: 0,
  GalleryCongressMeeting: 0,
  GalleryMeeting: 0,
  NationalAssembly: null,
  CongressMeeting: null,
  Meeting: null,
  GalleryObjectGuid: '00000000-0000-0000-0000-000000000000',
  ImagePath: '',
  FileSecurityLevel: 0
}

function AddPhotoDocument() {
  const history = useHistory()
  const toast = useToast()
  const [form] = Form.useForm()
  const { FileObjectGuid, GalleryObjectGuid, ObjectGuid } = useParams()
  const { nationalAssembly, congressMeeting, meeting, securityLevel } = useSelector(state => state.common)

  // State
  const [fileName, setFileName] = useState('')
  const [galleryName, setGalleryName] = useState('')
  const [fileList, setFileList] = useState([])
  const [fileLink, setFileLink] = useState({})
  const [isDisable, setIsDisable] = useState(false)
  const [archivesNumber, setArchivesNumber] = useState('')
  const [fileSecurityLevel, setFileSecurityLevel] = useState(1)

  // State Loading
  const [isLoading, setIsLoading] = useState(false)

  // State Modal
  const [isOpenModalDelete, setIsOpenModalDelete] = useState(false)

  // State List QHK, KHT, PH
  const [listNationalAssembly, setListNationalAssembly] = useState([])
  const [listCongressMeeting, setListCongressMeeting] = useState([])
  const [listMeeting, setListMeeting] = useState([])

  const disabledStartDate = current => {
    return current && current > moment(form.getFieldValue('DeliveryDate')).endOf('day')
  }

  const disabledEndDate = current => {
    return current && current < moment(form.getFieldValue('PhotoTime')).endOf('day')
  }

  const insertUpdatePaperDocument = (data, isContinue = false) => {
    setIsLoading(true)

    const body = {
      ...data,
      GalleryObjectGuid,
      FileSecurityLevel: fileSecurityLevel,
      NationalAssembly: data.NationalAssembly || 0,
      CongressMeeting: data.CongressMeeting || 0,
      Meeting: data.Meeting || 0,
      PhotoTime: moment(data.PhotoTime).format(),
      DeliveryDate: moment(data.DeliveryDate).format()
    }

    PhotoService.insertUpdate(body)
      .then(res => {
        setIsLoading(false)
        if (res.isError) return
        toast({
          title: `${!ObjectGuid ? 'Th??m m???i t??i li???u th??nh c??ng' : 'S???a t??i li???u th??nh c??ng'}`,
          status: 'success',
          position: 'bottom-right',
          duration: 2000,
          isClosable: true
        })
        if (!isContinue) {
          history.push(`${fileLink.url}/${FileObjectGuid}/gallery/${GalleryObjectGuid}/photo`)
        } else {
          setFileList([])
          form.setFieldsValue({
            ...form.getFieldsValue(true),
            ObjectGuid: '00000000-0000-0000-0000-000000000000',
            ImageTitle: '',
            ArchivesNumber: '',
            PhotoGearNo: 0,
            PhotoPocketNo: 0,
            PhotoNo: 0,
            FilmGearNo: 0,
            FilmPocketNo: 0,
            FilmNo: 0,
            Description: '',
            Format: 1,
            SecurityLevel: 1,
            PhotoStatus: 2,
            Mode: 2,
            FilmSize: '',
            Colour: 1,
            StorageTimeType: 2,
            Maintenance: '',
            PhotoType: 1,
            Form: 1,
            ImagePath: '',
            InforSign: ''
          })
          setIsDisable(false)
          setArchivesNumber('')
        }
      })
      .finally(() => setIsLoading(false))
  }

  const onSubmitForm = (isContinue = false) => {
    form.validateFields().then(() => {
      insertUpdatePaperDocument(form.getFieldsValue(true), isContinue)
    })
  }

  const getInforByObjectGuid = () => {
    setIsLoading(true)
    Promise.all([FileService.getOne(FileObjectGuid), GalleryService.getOne(GalleryObjectGuid)])
      .then(res => {
        if (!res[0].isError && !res[0].Status) {
          setFileName(res[0].Object?.FileNo)
          setFileSecurityLevel(res[0].Object?.SecurityLevel)
        }
        if (!res[1].isError && !res[1].Status) {
          setGalleryName(res[1].Object?.OrganizationCollectCode)
          form.setFieldsValue({
            ...form.getFieldsValue(true),
            GalleryNationalAssembly: res[1].Object?.NationalAssembly,
            GalleryCongressMeeting: res[1].Object?.CongressMeeting,
            GalleryMeeting: res[1].Object?.Meeting
          })
          if (res[1].Object?.NationalAssembly) {
            setListNationalAssembly(
              nationalAssembly.filter(item => Number(item.CodeValue) === res[1].Object?.NationalAssembly)
            )
          }
          if (res[1].Object?.CongressMeeting) {
            setListCongressMeeting(
              congressMeeting.filter(item => Number(item.CodeValue) === res[1].Object?.CongressMeeting)
            )
          }
          if (res[1].Object?.Meeting) {
            setListMeeting(meeting.filter(item => Number(item.CodeValue) === res[1].Object?.Meeting))
          }
        }
      })
      .finally(() => setIsLoading(false))
  }

  const getPhotoByObjectGuid = () => {
    setIsLoading(true)

    PhotoService.getOne(ObjectGuid)
      .then(res => {
        if (!res.isError && !res.Status) {
          form.setFieldsValue({
            ...res.Object,
            NationalAssembly: res.Object?.NationalAssembly ? res.Object?.NationalAssembly : null,
            CongressMeeting: res.Object?.CongressMeeting ? res.Object?.CongressMeeting : null,
            Meeting: res.Object?.Meeting ? res.Object?.Meeting : null,
            PhotoTime: moment(res.Object?.PhotoTime),
            DeliveryDate: moment(res.Object?.DeliveryDate)
          })
          if (res.Object?.ImagePath) {
            const lastIndex = res.Object?.ImagePath?.lastIndexOf('\\')
            const listFile = {
              uid: '0',
              name: `${res.Object?.ImagePath?.slice(lastIndex + 1)}`,
              status: 'done',
              response: {
                Object: res.Object?.ImagePath
              }
            }
            setFileList([listFile])
            setArchivesNumber(res?.Object?.ArchivesNumber)
          }
        }
      })
      .finally(() => setIsLoading(false))
  }

  const onDeleteFilmDocument = content => {
    const body = {
      ObjectGuid,
      Content: content.Content
    }
    PhotoService.delete(body)
      .then(res => {
        if (res.isError) return
        toast({
          title: `T??i li???u ???? ???????c x??a`,
          status: 'success',
          position: 'bottom-right',
          duration: 2000,
          isClosable: true
        })
        history.push(`${fileLink.url}/${FileObjectGuid}/gallery/${GalleryObjectGuid}/photo`)
      })
      .finally(() => {
        setIsOpenModalDelete(false)
      })
  }

  const onChangeFile = ({ file: newFile }) => {
    setFileList([newFile])

    if (newFile?.status === 'done') {
      form.setFieldsValue({
        ...form.getFieldsValue(true),
        ImagePath: newFile?.response?.Object
      })
    } else if (newFile?.status === 'removed') {
      setFileList([])
    } else if (newFile?.status === 'error') {
      toast({
        title: `T???i file l??n th???t b???i`,
        status: 'error',
        position: 'bottom-right',
        duration: 2000,
        isClosable: true
      })
    }
  }

  const setValueArchivesNumber = value => {
    if (value) {
      form.setFieldsValue({
        ...form.getFieldsValue(true),
        ArchivesNumber: value
      })
    }
  }

  const getFormByArchivesNumber = option => {
    if (option) {
      form.setFieldsValue({
        ...form.getFieldsValue(true),
        ...option,
        ObjectGuid: '00000000-0000-0000-0000-000000000000',
        DeliveryDate: moment(option?.DeliveryDate),
        PhotoTime: moment(option?.PhotoTime),
        IsExist: true
      })
      if (option?.ImagePath) {
        const lastIndex = option?.ImagePath?.lastIndexOf('\\')
        const listFile = {
          uid: '0',
          name: `${option?.ImagePath?.slice(lastIndex + 1)}`,
          status: 'done',
          response: {
            Object: option?.ImagePath
          }
        }
        setFileList([listFile])
      }
      if (option?.NationalAssembly) {
        setListNationalAssembly(nationalAssembly.filter(item => Number(item.CodeValue) === option?.NationalAssembly))
      }
      if (option?.CongressMeeting) {
        setListCongressMeeting(congressMeeting.filter(item => Number(item.CodeValue) === option?.CongressMeeting))
      }
      if (option?.Meeting) {
        setListMeeting(meeting.filter(item => Number(item.CodeValue) === option?.Meeting))
      }
      setIsDisable(true)
    } else {
      form.resetFields()
      setFileList([])
      setListNationalAssembly([])
      setListCongressMeeting([])
      setListMeeting([])
      setIsDisable(false)
      getInforByObjectGuid()
    }
  }

  useEffect(() => {
    setFileLink(getActiveLinkByPathName(history.location.pathname))
    getInforByObjectGuid()
    if (ObjectGuid) {
      getPhotoByObjectGuid()
    }
  }, [])

  return (
    <>
      <BreadcrumbWrapper>
        <Breadcrumb.Item>Qu???n l?? d??? li???u</Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to={fileLink.url}>{fileLink.name}</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>H??? s?? {fileName}</Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to={`${fileLink.url}/${FileObjectGuid}/gallery`}>S??u t???p ???nh</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{galleryName}</Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to={`${fileLink.url}/${FileObjectGuid}/gallery/${GalleryObjectGuid}/photo`}>T??i li???u ???nh</Link>
        </Breadcrumb.Item>
        {!ObjectGuid ? (
          <Breadcrumb.Item>Th??m m???i T??i li???u ???nh</Breadcrumb.Item>
        ) : (
          <Breadcrumb.Item>Xem, S???a T??i li???u ???nh</Breadcrumb.Item>
        )}
      </BreadcrumbWrapper>
      <AddDocumentWrapper>
        <FormAddDocumentWrapper>
          <Form
            layout="vertical"
            initialValues={initialValues}
            form={form}
            labelAlign="left"
            scrollToFirstError={{ behavior: 'smooth', block: 'center', inline: 'center' }}
            focusToFirstError
          >
            <Spin size="small" spinning={isLoading}>
              <BoxWrapper>
                <Row gutter={20}>
                  <Col span={24}>
                    <Form.Item
                      label="T??n s??? ki???n"
                      name="EventName"
                      required
                      rules={[
                        {
                          required: true,
                          message: 'Ch??a nh???p T??n s??? ki???n'
                        },
                        {
                          max: 500,
                          message: 'T??n s??? ki???n <= 500 k?? t???'
                        }
                      ]}
                    >
                      <Input placeholder="T??n s??? ki???n" disabled={isDisable} allowClear />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={20}>
                  <Col span={24}>
                    <Form.Item
                      label="Ti??u ?????"
                      name="ImageTitle"
                      required
                      rules={[
                        {
                          required: true,
                          message: 'Ch??a nh???p Ti??u ?????'
                        },
                        {
                          max: 500,
                          message: 'Ti??u ????? <= 500 k?? t???'
                        }
                      ]}
                    >
                      <Input placeholder="Ti??u ?????" disabled={isDisable} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={20}>
                  <Col span={4}>
                    <Form.Item
                      label="S??? l??u tr???"
                      name="ArchivesNumber"
                      required
                      rules={[
                        {
                          required: true,
                          message: 'Ch??a nh???p S??? l??u tr???'
                        },
                        {
                          max: 50,
                          message: 'S??? l??u tr??? <= 50 k?? t???'
                        }
                      ]}
                    >
                      <SuggestSearchArchivesNumber
                        archivesNumber={archivesNumber}
                        setArchivesNumber={setArchivesNumber}
                        setValueArchivesNumber={setValueArchivesNumber}
                        onSelect={getFormByArchivesNumber}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      label="Kh??a"
                      name="NationalAssembly"
                      rules={[
                        () => ({
                          validator(_, value) {
                            if (value === 0) {
                              form.setFieldsValue({
                                ...form.getFieldsValue(true),
                                NationalAssembly: null
                              })
                            }
                            return Promise.resolve()
                          }
                        })
                      ]}
                    >
                      <Select
                        showSearch
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        placeholder="Ch???n Kh??a"
                        disabled={isDisable}
                        getPopupContainer={trigger => trigger.parentNode}
                      >
                        <Option key={0} value={0}>
                          Kh??ng ch???n
                        </Option>
                        {!!listNationalAssembly &&
                          !!listNationalAssembly.length &&
                          listNationalAssembly.map((item, idx) => (
                            <Option key={idx} value={Number(item.CodeValue)}>
                              {item.Text}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      name="CongressMeeting"
                      label="K??? h???p th???"
                      rules={[
                        () => ({
                          validator(_, value) {
                            if (value === 0) {
                              form.setFieldsValue({
                                ...form.getFieldsValue(true),
                                CongressMeeting: null
                              })
                            }
                            return Promise.resolve()
                          }
                        })
                      ]}
                    >
                      <Select
                        showSearch
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        placeholder="Ch???n K??? h???p th???"
                        disabled={isDisable}
                        getPopupContainer={trigger => trigger.parentNode}
                      >
                        <Option key={0} value={0}>
                          Kh??ng ch???n
                        </Option>
                        {!!listCongressMeeting &&
                          !!listCongressMeeting.length &&
                          listCongressMeeting.map((item, idx) => (
                            <Option key={idx} value={Number(item.CodeValue)}>
                              {item.Text}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={4}>
                    <Form.Item
                      name="Meeting"
                      label="Phi??n h???p"
                      rules={[
                        () => ({
                          validator(_, value) {
                            if (value === 0) {
                              form.setFieldsValue({
                                ...form.getFieldsValue(true),
                                Meeting: null
                              })
                            }
                            return Promise.resolve()
                          }
                        })
                      ]}
                    >
                      <Select
                        showSearch
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        placeholder="Ch???n Phi??n h???p"
                        disabled={isDisable}
                        getPopupContainer={trigger => trigger.parentNode}
                      >
                        <Option key={0} value={0}>
                          Kh??ng ch???n
                        </Option>
                        {!!listMeeting &&
                          !!listMeeting.length &&
                          listMeeting.map((item, idx) => (
                            <Option key={idx} value={Number(item.CodeValue)}>
                              {item.Text}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      name="Photographer"
                      label="T??c gi???"
                      rules={[{ max: 300, message: 'T??n t??c gi??? <= 300 k?? t???' }]}
                    >
                      <Input placeholder="T??c gi???" disabled={isDisable} />
                    </Form.Item>
                  </Col>
                  <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues !== currentValues}>
                    {({ getFieldValue }) => (
                      <Col span={4}>
                        <Form.Item
                          name="PhotoTime"
                          label="Th???i gian ch???p"
                          dependencies={['DeliveryDate']}
                          required
                          rules={[
                            { required: true, message: 'Nh??p th???i gian ch???p' },
                            () => ({
                              validator(_, value) {
                                if (
                                  (!value ||
                                    moment(value.format('YYYY-MM-DD')).isAfter(
                                      moment(getFieldValue('DeliveryDate')).format('YYYY-MM-DD')
                                    )) &&
                                  getFieldValue('DeliveryDate')
                                ) {
                                  return Promise.reject(new Error(`Th???i gian ch???p ph???i tr?????c Ng??y giao n???p`))
                                }
                                return Promise.resolve()
                              }
                            })
                          ]}
                        >
                          <DatePicker
                            getPopupContainer={trigger => trigger.parentNode}
                            style={{ width: '100%' }}
                            locale={localeVN}
                            format={dateFormat}
                            inputReadOnly
                            disabled={isDisable}
                            disabledDate={disabledStartDate}
                          />
                        </Form.Item>
                      </Col>
                    )}
                  </Form.Item>
                </Row>
                <Row gutter={20}>
                  <Col span={8} className="custom-col-8">
                    <Form.Item
                      name="StorageTimeType"
                      label="Th???i h???n b???o qu???n"
                      rules={[
                        {
                          required: true,
                          message: 'Ch??a nh???p th???i h???n b???o qu???n'
                        }
                      ]}
                    >
                      <Radio.Group disabled={isDisable}>
                        <Radio value={1}>V??nh vi???n</Radio>
                        <Radio value={2}>C?? th???i h???n</Radio>
                      </Radio.Group>
                    </Form.Item>
                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, currentValues) =>
                        prevValues.StorageTimeType !== currentValues.StorageTimeType
                      }
                    >
                      {({ getFieldValue }) =>
                        getFieldValue('StorageTimeType') === 2 ? (
                          <>
                            <Col span={4}>
                              <Form.Item
                                name="Maintenance"
                                style={{ marginBottom: 'unset' }}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Ch??a nh???p th???i h???n b???o qu???n'
                                  }
                                ]}
                              >
                                <InputNumber min={1} max={70} disabled={isDisable} />
                              </Form.Item>
                            </Col>
                            <div>N??m</div>
                          </>
                        ) : null
                      }
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item name="PhotoType" label="Lo???i h??nh">
                      <Select
                        placeholder="Ch???n Lo???i h??nh"
                        getPopupContainer={trigger => trigger.parentNode}
                        disabled={isDisable}
                      >
                        <Option value={1}>Ch??n dung</Option>
                        <Option value={2}>Ho???t ?????ng</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item name="Form" label="H??nh th???c" required>
                      <Radio.Group disabled={isDisable}>
                        <Radio value={1}>D????ng b???n</Radio>
                        <Radio value={2}>??m b???n</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.Form !== currentValues.Form}
                  >
                    {({ getFieldValue }) =>
                      getFieldValue('Form') === 1 ? (
                        <>
                          <Col span={2}>
                            <Form.Item
                              name="PhotoGearNo"
                              label="H???p ???nh s???"
                              rules={[
                                () => ({
                                  validator(_, value) {
                                    if (!value || value.toString().length <= 5) {
                                      form.setFieldsValue({
                                        ...form.getFieldsValue(true),
                                        PhotoGearNo: value.toString().replace(/\D/g, '')
                                      })
                                      return Promise.resolve()
                                    }
                                    return Promise.reject(new Error('Nh???p H???p ???nh s??? <= 5 k?? t???'))
                                  }
                                })
                              ]}
                            >
                              <Input disabled={isDisable} />
                            </Form.Item>
                          </Col>
                          <Col span={2}>
                            <Form.Item
                              name="PhotoPocketNo"
                              label="T??i ???nh s???"
                              rules={[
                                () => ({
                                  validator(_, value) {
                                    if (!value || value.toString().length <= 5) {
                                      form.setFieldsValue({
                                        ...form.getFieldsValue(true),
                                        PhotoPocketNo: value.toString().replace(/\D/g, '')
                                      })
                                      return Promise.resolve()
                                    }
                                    return Promise.reject(new Error('Nh???p T??i ???nh s??? <= 5 k?? t???'))
                                  }
                                })
                              ]}
                            >
                              <Input disabled={isDisable} />
                            </Form.Item>
                          </Col>
                          <Col span={2}>
                            <Form.Item
                              name="PhotoNo"
                              label="???nh s???"
                              rules={[
                                () => ({
                                  validator(_, value) {
                                    if (!value || value.toString().length <= 5) {
                                      form.setFieldsValue({
                                        ...form.getFieldsValue(true),
                                        PhotoNo: value.toString().replace(/\D/g, '')
                                      })
                                      return Promise.resolve()
                                    }
                                    return Promise.reject(new Error('Nh???p ???nh s??? <= 5 k?? t???'))
                                  }
                                })
                              ]}
                            >
                              <Input disabled={isDisable} />
                            </Form.Item>
                          </Col>
                        </>
                      ) : (
                        <>
                          <Col span={2}>
                            <Form.Item
                              name="FilmGearNo"
                              label="H???p phim s???"
                              rules={[
                                () => ({
                                  validator(_, value) {
                                    if (!value || value.toString().length <= 5) {
                                      form.setFieldsValue({
                                        ...form.getFieldsValue(true),
                                        FilmGearNo: value.toString().replace(/\D/g, '')
                                      })
                                      return Promise.resolve()
                                    }
                                    return Promise.reject(new Error('Nh???p H???p phim s??? <= 5 k?? t???'))
                                  }
                                })
                              ]}
                            >
                              <Input disabled={isDisable} />
                            </Form.Item>
                          </Col>
                          <Col span={2}>
                            <Form.Item
                              name="FilmPocketNo"
                              label="T??i phim s???"
                              rules={[
                                () => ({
                                  validator(_, value) {
                                    if (!value || value.toString().length <= 5) {
                                      form.setFieldsValue({
                                        ...form.getFieldsValue(true),
                                        FilmPocketNo: value.toString().replace(/\D/g, '')
                                      })
                                      return Promise.resolve()
                                    }
                                    return Promise.reject(new Error('Nh???p T??i phim s??? <= 5 k?? t???'))
                                  }
                                })
                              ]}
                            >
                              <Input disabled={isDisable} />
                            </Form.Item>
                          </Col>
                          <Col span={2}>
                            <Form.Item
                              name="FilmNo"
                              label="Phim s???"
                              rules={[
                                () => ({
                                  validator(_, value) {
                                    if (!value || value.toString().length <= 5) {
                                      form.setFieldsValue({
                                        ...form.getFieldsValue(true),
                                        FilmNo: value.toString().replace(/\D/g, '')
                                      })
                                      return Promise.resolve()
                                    }
                                    return Promise.reject(new Error('Nh???p Phim s??? <= 5 k?? t???'))
                                  }
                                })
                              ]}
                            >
                              <Input disabled={isDisable} />
                            </Form.Item>
                          </Col>
                        </>
                      )
                    }
                  </Form.Item>
                </Row>
                <Row gutter={20}>
                  <Col span={24}>
                    <Form.Item
                      label="?????a ??i???m ch???p"
                      name="PhotoPlace"
                      rules={[{ max: 300, message: '?????a ??i???m ch???p kh??ng qu?? 300 k?? t???' }]}
                    >
                      <Input placeholder="?????a ??i???m ch???p" disabled={isDisable} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={20}>
                  <Col span={4}>
                    <Form.Item
                      name="Colour"
                      label="M??u s???c"
                      required
                      rules={[
                        {
                          required: true,
                          message: 'Ch??a ch???n m??u s???c'
                        }
                      ]}
                    >
                      <Select
                        placeholder="Ch???n M??u s???c"
                        getPopupContainer={trigger => trigger.parentNode}
                        disabled={isDisable}
                      >
                        <Option value={1}>M??u</Option>
                        <Option value={2}>??en tr???ng</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      name="FilmSize"
                      label="C??? phim/???nh"
                      required
                      rules={[
                        {
                          required: true,
                          message: 'Ch??a nh???p k??ch c??? phim/???nh'
                        }
                      ]}
                    >
                      <Input placeholder="C??? phim/???nh" disabled={isDisable} />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      name="Format"
                      label="T??nh tr???ng v???t l??"
                      required
                      rules={[
                        {
                          required: true,
                          message: 'Ch??a ch???n t??nh tr???ng v???t l??'
                        }
                      ]}
                    >
                      <Select
                        placeholder="Ch???n t??nh tr???ng v???t l??"
                        getPopupContainer={trigger => trigger.parentNode}
                        disabled={isDisable}
                      >
                        <Option value={1}>B??nh th?????ng</Option>
                        <Option value={2}>H?? h???ng</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      name="DeliveryUnit"
                      label="??V, CN giao ???nh"
                      rules={[
                        {
                          max: 100,
                          message: '??V, CN giao ???nh <= 100 k?? t???'
                        }
                      ]}
                    >
                      <Input placeholder="??V, CN giao ???nh" disabled={isDisable} />
                    </Form.Item>
                  </Col>
                  <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues !== currentValues}>
                    {({ getFieldValue }) => (
                      <Col span={4}>
                        <Form.Item
                          name="DeliveryDate"
                          label="Ng??y giao n???p"
                          dependencies={['PhotoTime']}
                          required
                          rules={[
                            { required: true, message: 'Nh???p ng??y giao n???p' },
                            () => ({
                              validator(_, value) {
                                if (
                                  (!value ||
                                    moment(value.format('YYYY-MM-DD')).isBefore(
                                      moment(getFieldValue('PhotoTime')).format('YYYY-MM-DD')
                                    )) &&
                                  getFieldValue('PhotoTime')
                                ) {
                                  return Promise.reject(new Error(`Ng??y giao n???p ph???i sau Th???i gian ch???p`))
                                }
                                return Promise.resolve()
                              }
                            })
                          ]}
                        >
                          <DatePicker
                            getPopupContainer={trigger => trigger.parentNode}
                            style={{ width: '100%' }}
                            locale={localeVN}
                            format={dateFormat}
                            inputReadOnly
                            disabled={isDisable}
                            disabledDate={disabledEndDate}
                          />
                        </Form.Item>
                      </Col>
                    )}
                  </Form.Item>
                  <Col span={4}>
                    <Form.Item name="SecurityLevel" label="????? b???o m???t">
                      <Select
                        placeholder="Ch???n ????? b???o m???t"
                        getPopupContainer={trigger => trigger.parentNode}
                        disabled={isDisable}
                      >
                        {!!securityLevel &&
                          !!securityLevel.length &&
                          securityLevel.map((item, idx) => (
                            <Option key={idx} value={Number(item?.CodeValue)}>
                              {item?.Text}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={20} style={{ alignItems: 'baseline' }}>
                  <Col>File t??i li???u</Col>
                  <Col>
                    <Form.Item name="ImagePath">
                      <UploadFile
                        multiple={false}
                        accept=".png, .jpeg, .jpg, .bmp"
                        fileList={fileList}
                        onChange={onChangeFile}
                        disabled={isDisable}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={20}>
                  <Col span={24}>
                    <Form.Item
                      name="Description"
                      label="Ghi ch??"
                      rules={[{ max: 500, message: 'Ghi ch?? <= 500 k?? t???' }]}
                    >
                      <TextArea disabled={isDisable} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={20}>
                  <Col span={4}>
                    <Form.Item name="Mode" label="Ch??? ????? s??? d???ng">
                      <Select
                        placeholder="Ch???n Ch??? ????? s??? d???ng"
                        getPopupContainer={trigger => trigger.parentNode}
                        disabled={isDisable}
                      >
                        <Option value={1}>H???n ch???</Option>
                        <Option value={2}>Kh??ng h???n ch???</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      name="InforSign"
                      label="K?? hi???u th??ng tin"
                      rules={[{ max: 30, message: 'K?? hi???u th??ng tin <= 30 k?? t???' }]}
                    >
                      <Input placeholder="K?? hi???u th??ng tin" disabled={isDisable} />
                    </Form.Item>
                  </Col>
                </Row>
                <div className="d-flex justify-content-center">
                  <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues !== currentValues}>
                    {({ getFieldValue }) => (
                      <Space size={20}>
                        {!isObjectGuidDefault(getFieldValue('ObjectGuid')) && (
                          <Button type="danger" key="delete" onClick={() => setIsOpenModalDelete(true)}>
                            X??a
                          </Button>
                        )}
                        <Button type="primary" onClick={() => onSubmitForm(false)}>
                          Ghi l???i
                        </Button>
                        {isObjectGuidDefault(getFieldValue('ObjectGuid')) && (
                          <Button type="primary" onClick={() => onSubmitForm(true)}>
                            Ghi l???i v?? th??m ti???p
                          </Button>
                        )}
                        <Button onClick={() => history.goBack()} key="back">
                          Quay l???i
                        </Button>
                      </Space>
                    )}
                  </Form.Item>
                </div>
              </BoxWrapper>
            </Spin>
          </Form>
        </FormAddDocumentWrapper>
      </AddDocumentWrapper>
      <ModalDeleteDocument
        visible={isOpenModalDelete}
        onOk={content => onDeleteFilmDocument(content)}
        onCancel={() => setIsOpenModalDelete(false)}
      />
    </>
  )
}

AddPhotoDocument.propTypes = {}

export default AddPhotoDocument
