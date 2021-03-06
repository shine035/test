import React, { useEffect, useState } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import moment from 'moment'
import { Breadcrumb, Form, Input, Col, Row, Select, DatePicker, Radio, Button, Spin, Space, InputNumber } from 'antd'
import { useToast } from '@chakra-ui/toast'

// API Service
import FilmService from 'src/api/FilmService'
import FileService from 'src/api/FileService'

// Components
import UploadFile from 'src/components/UploadFile'
import { ModalDeleteDocument } from 'src/components/Modals/component/ModalDeleteDocument'

// Function Helpers
import { isObjectGuidDefault } from 'src/helpers/ObjectGuid'
import { getActiveLinkByPathName } from 'src/helpers/string'
import { localeVN, dateFormat } from 'src/helpers/FomatDateTime'

// Styled Component
import { BreadcrumbWrapper, AddDocumentWrapper, FormAddDocumentWrapper, BoxWrapper } from '../styled/AddDocumentWrapper'

const { Option } = Select
const { TextArea } = Input

const initialValues = {
  ObjectGuid: '00000000-0000-0000-0000-000000000000',
  EventName: '',
  MovieTitle: '',
  ArchivesNumber: '',
  InforSign: '',
  Languages: ['TV'],
  Recorder: '',
  RecordDate: '',
  PlayTime: '',
  Quality: '',
  RecordPlace: '',
  Description: '',
  FilmStatus: 2,
  Format: 1,
  SecurityLevel: 1,
  StorageTimeType: 2,
  Maintenance: '',
  Mode: 2,
  FileNationalAssembly: 0,
  FileCongressMeeting: 0,
  FileMeeting: 0,
  NationalAssembly: null,
  CongressMeeting: null,
  Meeting: null,
  FileObjectGuid: '00000000-0000-0000-0000-000000000000',
  FileSecurityLevel: 0
}

function AddFilmDocument() {
  const history = useHistory()
  const [form] = Form.useForm()
  const toast = useToast()
  const { languages, nationalAssembly, congressMeeting, meeting, securityLevel } = useSelector(state => state.common)
  const { FileObjectGuid, ObjectGuid } = useParams()

  // State
  const [fileName, setFileName] = useState('')
  const [fileLink, setFileLink] = useState({})
  const [fileList, setFileList] = useState([])

  // State Modal
  const [isOpenModalDelete, setIsOpenModalDelete] = useState(false)

  // State Loading
  const [isLoading, setIsLoading] = useState(false)

  // State List QHK, KHT, PH
  const [listNationalAssembly, setListNationalAssembly] = useState([])
  const [listCongressMeeting, setListCongressMeeting] = useState([])
  const [listMeeting, setListMeeting] = useState([])

  const insertUpdateFilmDocument = (data, isContinue = false) => {
    const body = {
      ...data,
      FileObjectGuid,
      NationalAssembly: data.NationalAssembly || 0,
      CongressMeeting: data.CongressMeeting || 0,
      Meeting: data.Meeting || 0,
      PlayTime: data.PlayTime || '00:00:00',
      RecordDate: moment(data.RecordDate).format()
    }
    setIsLoading(true)
    FilmService.insertUpdate(body)
      .then(res => {
        setIsLoading(false)
        if (res.isError) return
        toast({
          title: `${!ObjectGuid ? 'Th??m m???i t??i li???u phim th??nh c??ng' : 'S???a t??i li???u phim th??nh c??ng'}`,
          status: 'success',
          position: 'bottom-right',
          duration: 2000,
          isClosable: true
        })
        if (!isContinue) {
          history.push(`${fileLink.url}/${FileObjectGuid}/film`)
        } else {
          setFileList([])
          form.setFieldsValue({
            ...form.getFieldsValue(true),
            ObjectGuid: '00000000-0000-0000-0000-000000000000',
            MovieTitle: '',
            ArchivesNumber: '',
            InforSign: '',
            Languages: ['TV'],
            PlayTime: '',
            Quality: '',
            Description: '',
            FilmStatus: 2,
            Format: 1,
            SecurityLevel: 1,
            StorageTimeType: 2,
            Maintenance: '',
            Mode: 2
          })
        }
      })
      .finally(() => setIsLoading(false))
  }

  const onChangeFile = ({ file: newFile }) => {
    setFileList([newFile])

    if (newFile?.status === 'done') {
      form.setFieldsValue({
        ...form.getFieldsValue(true),
        FilmPath: newFile?.response?.Object
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

  const onSubmitForm = (isContinue = false) => {
    form.validateFields().then(() => {
      insertUpdateFilmDocument(form.getFieldsValue(true), isContinue)
    })
  }

  const getFilmDocumentByObjectGuid = () => {
    FilmService.getOne(ObjectGuid).then(res => {
      if (!res.isError && !res.Status) {
        form.setFieldsValue({
          ...res.Object,
          NationalAssembly: res.Object?.NationalAssembly !== 0 ? res.Object?.NationalAssembly : null,
          CongressMeeting: res.Object?.CongressMeeting !== 0 ? res.Object?.CongressMeeting : null,
          Meeting: res.Object?.Meeting !== 0 ? res.Object?.Meeting : null,
          RecordDate: moment(res.Object?.RecordDate)
        })

        if (res.Object?.FilmPath) {
          const lastIndex = res.Object?.FilmPath?.lastIndexOf('\\')
          const listFile = {
            uid: '0',
            name: `${res.Object?.FilmPath?.slice(lastIndex + 1)}`,
            status: 'done',
            response: {
              Object: res.Object?.FilmPath
            }
          }
          setFileList([listFile])
        }
      }
    })
  }

  const getFileByObjectGuid = () => {
    FileService.getOne(FileObjectGuid).then(res => {
      if (!res.isError && !res.Status) {
        setFileName(res.Object?.FileNo)

        form.setFieldsValue({
          ...form.getFieldsValue(true),
          FileNationalAssembly: res.Object?.NationalAssembly,
          FileCongressMeeting: res.Object?.CongressMeeting,
          FileMeeting: res.Object?.Meeting,
          FileSecurityLevel: res.Object?.SecurityLevel
        })
        if (res.Object?.NationalAssembly) {
          setListNationalAssembly(
            nationalAssembly.filter(item => Number(item.CodeValue) === res.Object?.NationalAssembly)
          )
        }
        if (res.Object?.CongressMeeting) {
          setListCongressMeeting(congressMeeting.filter(item => Number(item.CodeValue) === res.Object?.CongressMeeting))
        }
        if (res.Object?.Meeting) {
          setListMeeting(meeting.filter(item => Number(item.CodeValue) === res.Object?.Meeting))
        }
      }
    })
  }

  const onDeleteFilmDocument = content => {
    const body = {
      ObjectGuid,
      Content: content.Content
    }
    FilmService.delete(body)
      .then(res => {
        if (res.isError) return
        toast({
          title: `T??i li???u ???? ???????c x??a th??nh c??ng`,
          status: 'success',
          position: 'bottom-right',
          duration: 2000,
          isClosable: true
        })
        history.push(`${fileLink.url}/${FileObjectGuid}/film`)
      })
      .finally(() => {
        setIsOpenModalDelete(false)
      })
  }

  useEffect(() => {
    setFileLink(getActiveLinkByPathName(history.location.pathname))
    getFileByObjectGuid()
    if (ObjectGuid) {
      getFilmDocumentByObjectGuid()
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
          <Link to={`${fileLink.url}/${FileObjectGuid}/film`}>T??i li???u phim ???nh, ??m thanh</Link>
        </Breadcrumb.Item>
        {!ObjectGuid ? (
          <Breadcrumb.Item>Th??m m???i T??i li???u phim ???nh, ??m thanh</Breadcrumb.Item>
        ) : (
          <Breadcrumb.Item>Xem, S???a T??i li???u phim ???nh, ??m thanh</Breadcrumb.Item>
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
                      <Input placeholder="T??n s??? ki???n" allowClear />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={20}>
                  <Col span={24}>
                    <Form.Item
                      label="Ti??u ?????"
                      name="MovieTitle"
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
                      <Input placeholder="Ti??u ?????" />
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
                      <Input placeholder="S??? l??u tr???" />
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
                        getPopupContainer={trigger => trigger.parentNode}
                        disabled={!listNationalAssembly.length}
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
                        getPopupContainer={trigger => trigger.parentNode}
                        disabled={!listNationalAssembly.length}
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
                        getPopupContainer={trigger => trigger.parentNode}
                        disabled={!listNationalAssembly.length}
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
                  <Col span={8} className="custom-col-8">
                    <Form.Item
                      name="StorageTimeType"
                      label="Th???i h???n b???o qu???n"
                      rules={[
                        {
                          required: true,
                          message: 'Ch??a ch???n lo???i th???i h???n b???o qu???n'
                        }
                      ]}
                    >
                      <Radio.Group>
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
                                <InputNumber min={1} max={70} />
                              </Form.Item>
                            </Col>
                            <div>N??m</div>
                          </>
                        ) : null
                      }
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={20}>
                  <Col span={24}>
                    <Form.Item name="Languages" label="Ng??n ng???">
                      <Select
                        mode="multiple"
                        showSearch
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        allowClear
                        showArrow
                        placeholder="Ch???n ng??n ng???"
                        getPopupContainer={trigger => trigger.parentNode}
                      >
                        {languages.map((item, idx) => (
                          <Option key={idx} value={item.CodeKey}>
                            {item.Text}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={20}>
                  <Col span={4}>
                    <Form.Item
                      name="Mode"
                      label="Ch??? ????? s??? d???ng"
                      required
                      rules={[
                        {
                          required: true,
                          message: 'Ch??a ch???n Ch??? ????? s??? d???ng'
                        }
                      ]}
                    >
                      <Select placeholder="Ch???n Ch??? ????? s??? d???ng" getPopupContainer={trigger => trigger.parentNode}>
                        <Option value={1}>H???n ch???</Option>
                        <Option value={2}>Kh??ng h???n ch???</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      name="InforSign"
                      label="K?? hi???u th??ng tin"
                      rules={[
                        {
                          max: 30,
                          message: 'K?? hi???u th??ng tin <= 30 k?? t???'
                        }
                      ]}
                    >
                      <Input placeholder="K?? hi???u th??ng tin" />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      name="Recorder"
                      label="T??c gi???"
                      rules={[
                        {
                          max: 300,
                          message: 'K?? hi???u th??ng tin <= 300 k?? t???'
                        }
                      ]}
                    >
                      <Input placeholder="T??c gi???" />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      name="RecordDate"
                      label="Th???i gian"
                      required
                      rules={[
                        {
                          required: true,
                          message: 'Ch??a ch???n Th???i gian'
                        }
                      ]}
                    >
                      <DatePicker
                        getPopupContainer={trigger => trigger.parentNode}
                        style={{ width: '100%' }}
                        locale={localeVN}
                        format={dateFormat}
                        inputReadOnly
                      />
                    </Form.Item>
                  </Col>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => prevValues.PlayTime !== currentValues.PlayTime}
                  >
                    <Col span={4}>
                      <Form.Item
                        name="PlayTime"
                        label="Th???i l?????ng"
                        rules={[
                          () => ({
                            validator(_, value) {
                              if (!value || value.length <= 8) {
                                const playTime = value.replace(/(\d{2})(?=(\d)+(?!\d))/g, '$1:')
                                form.setFieldsValue({
                                  ...form.getFieldsValue(true),
                                  PlayTime: playTime
                                })
                                return Promise.resolve()
                              }
                              return Promise.resolve()
                            }
                          }),
                          { pattern: new RegExp('^\\d{2}:\\d{2}:\\d{2}$'), message: 'Sai ?????nh d???ng Th???i l?????ng' }
                        ]}
                      >
                        <Input placeholder="00:00:00" />
                      </Form.Item>
                    </Col>
                  </Form.Item>
                  <Col span={4}>
                    <Form.Item
                      name="Quality"
                      label="Ch???t l?????ng"
                      rules={[
                        {
                          max: 50,
                          message: 'Ch???t l?????ng <= 50 k?? t???'
                        }
                      ]}
                    >
                      <Input placeholder="Ch???t l?????ng" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={20}>
                  <Col span={24}>
                    <Form.Item
                      label="?????a ??i???m"
                      name="RecordPlace"
                      rules={[
                        {
                          max: 300,
                          message: '?????a ??i???m <= 300 k?? t???'
                        }
                      ]}
                    >
                      <Input placeholder="?????a ??i???m" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={20} style={{ alignItems: 'baseline' }}>
                  <Col>File t??i li???u</Col>
                  <Col>
                    <Form.Item name="FilmPath">
                      <UploadFile accept="mp3, .mp4, .wma" fileList={fileList} onChange={onChangeFile} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={20}>
                  <Col span={24}>
                    <Form.Item
                      name="Description"
                      label="Ghi ch??"
                      rules={[
                        {
                          max: 500,
                          message: 'K?? hi???u th??ng tin <= 500 k?? t???'
                        }
                      ]}
                    >
                      <TextArea />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={20}>
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
                      <Select placeholder="Ch???n T??nh tr???ng v???t l??" getPopupContainer={trigger => trigger.parentNode}>
                        <Option value={1}>B??nh th?????ng</Option>
                        <Option value={2}>H?? h???ng</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      name="SecurityLevel"
                      label="????? b???o m???t"
                      required
                      rules={[
                        {
                          required: true,
                          message: 'Ch??a nh???p m?? ?????nh danh v??n b???n'
                        }
                      ]}
                    >
                      <Select placeholder="Ch???n ????? b???o m???t" getPopupContainer={trigger => trigger.parentNode}>
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

AddFilmDocument.propTypes = {}

export default AddFilmDocument
