import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Link, useHistory } from 'react-router-dom'
import { Breadcrumb, Form, Input, Col, Row, Select, DatePicker, Radio, Button, Space, Spin, InputNumber } from 'antd'
import moment from 'moment'
import { useToast } from '@chakra-ui/toast'
import { useSelector } from 'react-redux'

// Component
import { ModalDeleteDocument } from 'src/components/Modals/component/ModalDeleteDocument'
import { ModalConfirmReception } from 'src/components/Modals/component/ModalConfirmReception'
import { ModalDenyReception } from 'src/components/Modals/component/ModalDenyReception'
import UploadFile from 'src/components/UploadFile'

// Function Helpers
import { isObjectGuidDefault } from 'src/helpers/ObjectGuid'
import { getActiveLinkByPathName } from 'src/helpers/string'
import { localeVN, dateFormat } from 'src/helpers/FomatDateTime'

// API Service
import DocumentService from 'src/api/DocumentService'
import FileService from 'src/api/FileService'
import SuggestSearchFileNotation from './SuggestSearchFileNotation'

// Styled Component
import { BreadcrumbWrapper, AddDocumentWrapper, FormAddDocumentWrapper, BoxWrapper } from '../styled/AddDocumentWrapper'

const { Option } = Select
const { TextArea } = Input

// RegExp
const CHECK_FORMAT_FILENOTATION = '^[a-zA-Z0-9]+/[a-zA-Z0-9]+-[a-zA-Z0-9]+$'
const CHECK_FORMAT_DOCCODE = '^[a-zA-Z0-9\\.\\-]*$'

// const ID_TYPENAME_CV = 28
// const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT

const initialValues = {
  ObjectGuid: '00000000-0000-0000-0000-000000000000',
  DocCode: '',
  CodeNumber: '',
  TypeName: null,
  OrganName: null,
  AgencyCreate: null,
  FileNotation: '',
  Field: null,
  IssuedDate: '',
  InforSign: '',
  PiecesOfPaper: '',
  PageAmount: '',
  Languages: ['TV'],
  SecurityLevel: 1,
  Autograph: '',
  Subject: '',
  KeywordIssue: '',
  KeywordPlace: '',
  KeywordEvent: '',
  Description: '',
  DocStatus: 2,
  Format: 1,
  Mode: 2,
  ConfidenceLevel: null,
  StorageTimeType: 2,
  Maintenance: '',
  CongressMeeting: null,
  FileCongressMeeting: 0,
  Meeting: null,
  FileMeeting: 0,
  NationalAssembly: null,
  FileNationalAssembly: 0,
  FileObjectGuid: '00000000-0000-0000-0000-000000000000',
  DocumentPaths: [''],
  FileSecurityLevel: 0,
  OrdinalNumber: 0,
  IsExist: false
}

function AddPaperDocument() {
  const [form] = Form.useForm()
  const { FileObjectGuid, ObjectGuid } = useParams()
  const toast = useToast()
  const history = useHistory()
  const {
    languages,
    documentTypes,
    organName,
    // agencyCreate,
    nationalAssembly,
    congressMeeting,
    meeting,
    securityLevel
  } = useSelector(state => state.common)

  // State
  const [fileName, setFileName] = useState('')
  const [fileList, setFileList] = useState([])
  const [isReceiving, setIsReceiving] = useState(false)
  const [fileLink, setFileLink] = useState({})
  const [oldOrdinalNumber, setOldOrdinalNumber] = useState()
  const [soKyHieu, setSoKyHieu] = useState('')

  const [fileNationalAssembly, setFileNationalAssembly] = useState()
  const [fileCongressMeeting, setFileCongressMeeting] = useState()
  const [fileMeeting, setFileMeeting] = useState()
  const [fileSecurityLevel, setFileSecurityLevel] = useState()

  // State of Modal
  const [isOpenModalDeleteDocument, setIsOpenModalDeleteDocument] = useState(false)
  const [isOpenModalConfirmReception, setIsOpenModalConfirmReception] = useState(false)
  const [isOpenModalDenyReception, setIsOpenModalDenyReception] = useState(false)

  // State Loading
  const [isLoading, setIsLoading] = useState(false)

  // State List QHK, KHT, PH
  const [listNationalAssembly, setListNationalAssembly] = useState([])
  const [listCongressMeeting, setListCongressMeeting] = useState([])
  const [listMeeting, setListMeeting] = useState([])

  const onSubmitForm = data => {
    if (ObjectGuid) {
      insertUpdatePaperDocument(data)
    } else {
      onCheckExistOrdinalNumber(data?.OrdinalNumber).then(res => {
        if (!res?.isOk) return
        insertUpdatePaperDocument(data)
      })
    }
  }

  const insertUpdatePaperDocument = data => {
    const body = {
      ...data,
      Field: data.Field || '',
      FileObjectGuid,
      FileNationalAssembly: fileNationalAssembly,
      FileCongressMeeting: fileCongressMeeting,
      FileMeeting: fileMeeting,
      FileSecurityLevel: fileSecurityLevel,
      ConfidenceLevel: data.ConfidenceLevel || 0,
      CongressMeeting: data.CongressMeeting || 0,
      Meeting: data.Meeting || 0,
      NationalAssembly: data.NationalAssembly || 0,
      PiecesOfPaper: data.PiecesOfPaper || 0,
      PageAmount: data.PageAmount || 0,
      IssuedDate: moment(data.IssuedDate).format()
    }
    setIsLoading(true)
    DocumentService.insertUpdate(body)
      .then(response => {
        setIsLoading(false)
        if (response?.isError) return
        toast({
          title: `${!ObjectGuid ? 'Th??m m???i t??i li???u th??nh c??ng' : 'S???a t??i li???u th??nh c??ng'}`,
          status: 'success',
          position: 'bottom-right',
          duration: 2000,
          isClosable: true
        })
        history.push(`${fileLink.url}/${FileObjectGuid}/paper`)
      })
      .finally(() => setIsLoading(false))
  }

  const getFileByFileObjectGuid = () => {
    setIsLoading(true)
    FileService.getOne(FileObjectGuid)
      .then(res => {
        if (!res.isError && !res.Status) {
          setFileName(res.Object?.FileNo)
          setFileNationalAssembly(res.Object?.NationalAssembly)
          setFileCongressMeeting(res.Object?.CongressMeeting)
          setFileMeeting(res.Object?.Meeting)
          setFileSecurityLevel(res.Object?.SecurityLevel)

          if (res.Object?.NationalAssembly) {
            setListNationalAssembly(
              nationalAssembly.filter(item => Number(item.CodeValue) === res.Object?.NationalAssembly)
            )
          }
          if (res.Object?.CongressMeeting) {
            setListCongressMeeting(
              congressMeeting.filter(item => Number(item.CodeValue) === res.Object?.CongressMeeting)
            )
          }
          if (res.Object?.Meeting) {
            setListMeeting(meeting.filter(item => Number(item.CodeValue) === res.Object?.Meeting))
          }
        }
      })
      .finally(() => setIsLoading(false))
  }

  const getOrdinalNumber = () => {
    DocumentService.getOrdinalNumber({ FileObjectGuid }).then(res => {
      if (!res.isError && !res.Status) {
        form.setFieldsValue({
          ...form.getFieldsValue(true),
          OrdinalNumber: res.Object
        })
        setOldOrdinalNumber(res?.Object)
      }
    })
  }

  const getPaperDocumentByObjectGuid = () => {
    setIsLoading(true)
    DocumentService.getOne(ObjectGuid)
      .then(res => {
        if (!res.isError && !res.Status) {
          setSoKyHieu(res.Object?.FileNotation)
          form.setFieldsValue({
            ...res?.Object,
            NationalAssembly: res.Object?.NationalAssembly ? res.Object?.NationalAssembly : null,
            CongressMeeting: res.Object?.CongressMeeting ? res.Object?.CongressMeeting : null,
            Meeting: res.Object?.Meeting ? res.Object?.Meeting : null,
            IssuedDate: moment(res.Object?.IssuedDate),
            Field: res.Object?.Field || null,
            ConfidenceLevel: res.Object?.ConfidenceLevel || null,
            SecurityLevel: res.Object?.SecurityLevel ? res.Object?.SecurityLevel : null,
            PiecesOfPaper: res?.Object?.PiecesOfPaper.toString(),
            PageAmount: res?.Object?.PageAmount.toString()
          })
          const listFile = res.Object?.DocumentPaths.map((item, idx) => {
            const lastIndex = item.lastIndexOf('\\')
            return {
              uid: `${idx + 1}`,
              name: `${item.slice(lastIndex + 1)}`,
              status: 'done',
              response: {
                Object: item
              }
              // url: `${API_ENDPOINT}${item}`
            }
          })
          setFileList(listFile)
          setOldOrdinalNumber(res?.Object?.OrdinalNumber)
          setIsReceiving(res.Object?.DocStatus === 1)
        }
      })
      .finally(() => setIsLoading(false))
  }

  const onReceivePaperDocument = () => {
    const body = {
      ObjectGuid,
      FileObjectGuid,
      ListObjectGuidDocSync: [ObjectGuid]
    }
    setIsLoading(true)
    DocumentService.receive(body)
      .then(res => {
        if (res.isError) return
        toast({
          title: `Ti???p nh???n t??i li???u th??nh c??ng`,
          status: 'success',
          position: 'bottom-right',
          duration: 2000,
          isClosable: true
        })
        history.push(`${fileLink.url}/${FileObjectGuid}/paper`)
      })
      .finally(() => setIsLoading(false))
  }

  const onRejectPaperDocument = content => {
    const body = {
      ObjectGuid,
      Content: content.Content
    }

    setIsLoading(true)
    DocumentService.reject(body)
      .then(res => {
        if (res.isError) return
        toast({
          title: `T??i li???u ???? b??? t??? ch???i`,
          status: 'success',
          position: 'bottom-right',
          duration: 2000,
          isClosable: true
        })
        history.push(`${fileLink.url}/${FileObjectGuid}/paper`)
      })
      .finally(() => setIsLoading(false))
  }

  const onDeletePaperDocument = content => {
    const body = {
      ObjectGuid,
      Content: content.Content
    }

    setIsLoading(true)
    DocumentService.delete(body)
      .then(res => {
        if (res.isError) return
        toast({
          title: `T??i li???u ???? ???????c x??a`,
          status: 'success',
          position: 'bottom-right',
          duration: 2000,
          isClosable: true
        })
        history.push(`${fileLink.url}/${FileObjectGuid}/paper`)
      })
      .finally(() => setIsLoading(false))
  }

  const onChangeFile = ({ fileList: newFileList }) => {
    setFileList(newFileList)
    let lstFile = []
    newFileList.forEach(item => {
      if (item?.status === 'done') {
        lstFile = [...lstFile, item.response?.Object]
        form.setFieldsValue({
          ...form.getFieldsValue(true),
          DocumentPaths: lstFile
        })
      } else if (item.status === 'error') {
        toast({
          title: `T???i file l??n th???t b???i`,
          status: 'error',
          position: 'bottom-right',
          duration: 2000,
          isClosable: true
        })
      }
    })
  }

  const onCheckExistOrdinalNumber = OrdinalNumber => {
    const body = {
      FileObjectGuid,
      OrdinalNumber
    }

    return DocumentService.checkExistOrdinalNumber(body)
  }

  const setFileNotation = value => {
    if (value) {
      form.setFieldsValue({
        ...form.getFieldsValue(true),
        FileNotation: value
      })
    }
  }

  const getFormByFileNotation = option => {
    if (option) {
      form.setFieldsValue({
        ...form.getFieldsValue(true),
        ...option,
        ObjectGuid: '00000000-0000-0000-0000-000000000000',
        IssuedDate: moment(option?.IssuedDate),
        PiecesOfPaper: option?.PiecesOfPaper.toString(),
        PageAmount: option?.PageAmount.toString(),
        Languages: option?.Languages || [],
        DocumentPaths: option?.DocumentPaths || [],
        NationalAssembly: option?.NationalAssembly || null,
        Meeting: option?.Meeting || null,
        CongressMeeting: option?.CongressMeeting || null,
        OrdinalNumber: oldOrdinalNumber,
        IsExist: true
      })
      if (option?.NationalAssembly) {
        setListNationalAssembly(nationalAssembly.filter(item => Number(item.CodeValue) === option?.NationalAssembly))
      }
      if (option?.CongressMeeting) {
        setListCongressMeeting(congressMeeting.filter(item => Number(item.CodeValue) === option?.CongressMeeting))
      }
      if (option?.Meeting) {
        setListMeeting(meeting.filter(item => Number(item.CodeValue) === option?.Meeting))
      }
      setIsReceiving(true)
      setSoKyHieu(option?.FileNotation)
    } else {
      form.resetFields()
      form.setFieldsValue({
        ObjectGuid: '00000000-0000-0000-0000-000000000000',
        OrdinalNumber: oldOrdinalNumber
      })
      setIsReceiving(false)
    }
  }

  useEffect(() => {
    setFileLink(getActiveLinkByPathName(history.location.pathname))
    getFileByFileObjectGuid()

    if (ObjectGuid) {
      getPaperDocumentByObjectGuid()
    } else {
      getOrdinalNumber()
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
          <Link to={`${fileLink.url}/${FileObjectGuid}/paper`}>T??i li???u gi???y</Link>
        </Breadcrumb.Item>
        {!ObjectGuid ? (
          <Breadcrumb.Item>Th??m m???i T??i li???u gi???y</Breadcrumb.Item>
        ) : (
          <Breadcrumb.Item>Xem, S???a T??i li???u gi???y</Breadcrumb.Item>
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
            onFinish={() => onSubmitForm(form.getFieldsValue(true))}
          >
            <Spin size="small" spinning={isLoading}>
              <BoxWrapper>
                <div className="title-box">
                  <b className="title-label">Th??ng tin c?? b???n: </b>
                </div>
                <Row gutter={20}>
                  <Col span={4}>
                    <Form.Item
                      name="OrdinalNumber"
                      label="S??? th??? t???"
                      rules={[
                        {
                          required: true,
                          message: 'Ch??a nh???p S??? th??? t???'
                        },
                        () => ({
                          validator(_, value) {
                            if (value && value.toString() !== oldOrdinalNumber.toString()) {
                              return Promise.resolve(onCheckExistOrdinalNumber(value)).then(res => {
                                if (res?.isError) {
                                  return Promise.reject(new Error('S??? th??? t??? t??i li???u gi???y ???? t???n t???i!'))
                                }
                                return Promise.resolve()
                              })
                            }
                            return Promise.resolve()
                          }
                        })
                      ]}
                    >
                      <Input placeholder="S??? th??? t???" />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      label="M?? ?????nh danh v??n b???n"
                      name="DocCode"
                      rules={[
                        {
                          required: true,
                          message: 'Ch??a nh???p M?? ?????nh danh v??n b???n'
                        },
                        {
                          max: 25,
                          message: 'M?? ?????nh danh v??n b???n <= 25 k?? t???'
                        },
                        {
                          pattern: new RegExp(CHECK_FORMAT_DOCCODE),
                          message: 'M?? ?????nh d???ng v??n b???n kh??ng ch???a d???u, k?? t??? ?????c bi???t'
                        }
                      ]}
                    >
                      <Input placeholder="M?? ?????nh danh v??n b???n" disabled={isReceiving} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="FileNotation"
                      label="S??? v?? k?? hi???u: (VD: aaa/aaa-aaa)"
                      rules={[
                        {
                          required: true,
                          message: 'Ch??a nh???p S??? v?? k?? hi???u'
                        },
                        {
                          pattern: new RegExp(CHECK_FORMAT_FILENOTATION),
                          message: 'Sai ?????nh d???ng S??? v?? k?? hi???u'
                        }
                      ]}
                    >
                      <SuggestSearchFileNotation
                        soKyHieu={soKyHieu}
                        setSoKyHieu={setSoKyHieu}
                        onSelect={getFormByFileNotation}
                        setFileNotation={setFileNotation}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={20}>
                  <Col span={24}>
                    <Form.Item
                      name="Subject"
                      label="Tr??ch y???u n???i dung"
                      required
                      rules={[
                        {
                          required: true,
                          message: 'Ch??a nh???p Tr??ch y???u n???i dung'
                        },
                        {
                          max: 500,
                          message: 'Tr??ch y???u n???i dung <= 500 k?? t???'
                        }
                      ]}
                    >
                      <TextArea disabled={isReceiving} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={20}>
                  <Col span={4}>
                    <Form.Item
                      name="CodeNumber"
                      label="S??? v??n b???n"
                      dependencies={['FileNotation']}
                      rules={[{ max: 11, message: 'S??? v??n b???n <= 11 k?? t???' }]}
                    >
                      <Input placeholder="S??? v??n b???n" disabled={isReceiving} />
                    </Form.Item>
                  </Col>

                  <Col span={4}>
                    <Form.Item
                      name="TypeName"
                      label="Lo???i v??n b???n"
                      rules={[
                        {
                          required: true,
                          message: 'Ch??a ch???n Lo???i v??n b???n'
                        }
                      ]}
                    >
                      <Select
                        showSearch
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        placeholder="Ch???n Lo???i v??n b???n"
                        disabled={isReceiving}
                        getPopupContainer={trigger => trigger.parentNode}
                      >
                        {!!documentTypes &&
                          !!documentTypes.length &&
                          documentTypes.map((item, idx) => (
                            <Option key={idx} value={Number(item.CodeValue)}>
                              {item.Text}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      name="OrganName"
                      label="CQ, t??? ch???c ban h??nh"
                      required
                      rules={[
                        {
                          required: true,
                          message: 'Ch??a ch???n CQ, t??? ch???c ban h??nh'
                        }
                      ]}
                    >
                      <Select
                        showSearch
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        placeholder="Ch???n CQ, t??? ch???c ban h??nh"
                        disabled={isReceiving}
                        getPopupContainer={trigger => trigger.parentNode}
                      >
                        {!!organName &&
                          !!organName.length &&
                          organName.map((item, idx) => (
                            <Option key={idx} value={Number(item.CodeValue)}>
                              {item.Text}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      name="Mode"
                      label="Ch??? ????? s??? d???ng"
                      required
                      rules={[
                        {
                          required: true,
                          message: 'Ch??a nh???p Ch??? ????? s??? d???ng'
                        }
                      ]}
                    >
                      <Select
                        placeholder="Ch???n Ch??? ????? s??? d???ng"
                        disabled={isReceiving}
                        getPopupContainer={trigger => trigger.parentNode}
                      >
                        <Option value={1}>H???n ch???</Option>
                        <Option value={2}>Kh??ng h???n ch???</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item name="AgencyCreate" label="????n v??? so???n th???o">
                      <Input placeholder="????n v??? so???n th???o" disabled={isReceiving} />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item name="Field" label="L??nh v???c">
                      <Select
                        showSearch
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        placeholder="Ch???n L??nh v???c"
                        disabled={isReceiving}
                        getPopupContainer={trigger => trigger.parentNode}
                      >
                        <Option value="1">L??nh v???c 1</Option>
                        <Option value="2">L??nh v???c 2</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={20}>
                  <Col span={4}>
                    <Form.Item
                      name="SecurityLevel"
                      label="????? b???o m???t"
                      required
                      rules={[
                        {
                          required: true,
                          message: 'Ch??a nh???p ????? b???o m???t'
                        }
                      ]}
                    >
                      <Select
                        placeholder="Ch???n ????? b???o m???t"
                        disabled={isReceiving}
                        getPopupContainer={trigger => trigger.parentNode}
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
                      <Radio.Group disabled={isReceiving}>
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
                                <InputNumber min={1} max={70} disabled={isReceiving} />
                              </Form.Item>
                            </Col>
                            <div>N??m</div>
                          </>
                        ) : null
                      }
                    </Form.Item>
                  </Col>
                </Row>
              </BoxWrapper>
              <BoxWrapper>
                <div className="title-box">
                  <b className="title-label">Th???i gian: </b>
                </div>
                <Row gutter={20}>
                  <Col span={4}>
                    <Form.Item
                      name="IssuedDate"
                      label="Ng??y v??n b???n"
                      required
                      rules={[
                        {
                          required: true,
                          message: 'Ch??a nh???p Ng??y v??n b???n'
                        }
                      ]}
                    >
                      <DatePicker
                        getPopupContainer={trigger => trigger.parentNode}
                        style={{ width: '100%' }}
                        locale={localeVN}
                        format={dateFormat}
                        inputReadOnly
                        disabled={isReceiving}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      name="NationalAssembly"
                      label="Nhi???m k???"
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
                        placeholder="Ch???n nhi???m k???"
                        disabled={isReceiving}
                        getPopupContainer={trigger => trigger.parentNode}
                      >
                        <Option key={0} value={0}>
                          Kh??ng ch???n
                        </Option>
                        {!!listNationalAssembly &&
                          !!listNationalAssembly.length &&
                          listNationalAssembly.map((item, idx) => (
                            <Option key={idx + 1} value={Number(item.CodeValue)}>
                              {item.Text}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4} className="d-none">
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
                        disabled={isReceiving}
                        getPopupContainer={trigger => trigger.parentNode}
                      >
                        <Option key={0} value={0}>
                          Kh??ng ch???n
                        </Option>
                        {!!listCongressMeeting &&
                          !!listCongressMeeting.length &&
                          listCongressMeeting.map((item, idx) => (
                            <Option key={idx + 1} value={Number(item.CodeValue)}>
                              {item.Text}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4} className="d-none">
                    <Form.Item
                      name="Meeting"
                      label="Phi??n h???p t???"
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
                        disabled={isReceiving}
                        getPopupContainer={trigger => trigger.parentNode}
                      >
                        <Option key={0} value={0}>
                          Kh??ng ch???n
                        </Option>
                        {!!listMeeting &&
                          !!listMeeting.length &&
                          listMeeting.map((item, idx) => (
                            <Option key={idx + 1} value={Number(item.CodeValue)}>
                              {item.Text}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </BoxWrapper>
              <BoxWrapper>
                <div className="title-box">
                  <b className="title-label">Th??ng tin kh??c: </b>
                </div>
                <Row gutter={20}>
                  <Col span={4}>
                    <Form.Item
                      name="InforSign"
                      label="K?? hi???u th??ng tin"
                      rules={[
                        {
                          max: 30,
                          message: 'K?? hi???u th??ng tin ??t h??n 30 k?? t???'
                        }
                      ]}
                    >
                      <Input placeholder="K?? hi???u th??ng tin" disabled={isReceiving} />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      name="PiecesOfPaper"
                      label="S??? t???"
                      rules={[
                        {
                          required: true,
                          message: 'Ch??a nh???p S??? t???'
                        }
                      ]}
                    >
                      <InputNumber min={0} max={9999999999} placeholder="S??? t???" disabled={isReceiving} />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      name="PageAmount"
                      label="S??? trang"
                      rules={[
                        {
                          required: true,
                          message: 'Ch??a nh???p S??? trang'
                        }
                      ]}
                    >
                      <InputNumber min={0} max={9999999999} placeholder="S??? trang" disabled={isReceiving} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="Languages" label="Ng??n ng???">
                      <Select
                        mode="multiple"
                        allowClear
                        showSearch
                        showArrow
                        placeholder="Ch???n ng??n ng???"
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        disabled={isReceiving}
                        getPopupContainer={trigger => trigger.parentNode}
                      >
                        {!!languages &&
                          !!languages.length &&
                          languages.map((item, idx) => (
                            <Option key={idx} value={item.CodeKey}>
                              {item.Text}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={20}>
                  <Col span={24}>
                    <Form.Item
                      name="Autograph"
                      label="B??t t??ch"
                      rules={[
                        {
                          max: 2000,
                          message: 'B??t t??ch <= 2000 k?? t???'
                        }
                      ]}
                    >
                      <TextArea rows={1} disabled={isReceiving} />
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
                          message: 'Ghi ch?? <= 500 k?? t???'
                        }
                      ]}
                    >
                      <TextArea disabled={isReceiving} />
                    </Form.Item>
                  </Col>
                </Row>
                <div className="bg-keyword">
                  <div className="title-box">
                    <b>T??? kh??a: </b>
                  </div>
                  <Row gutter={20}>
                    <Col span={8}>
                      <Form.Item
                        name="KeywordIssue"
                        label="V???n ????? ch??nh"
                        rules={[
                          {
                            required: false,
                            message: 'Nh???p V???n ????? ch??nh kh??ng qu?? 100 k?? t???!',
                            max: 100
                          }
                        ]}
                      >
                        <Input placeholder="V???n ????? ch??nh" disabled={isReceiving} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="KeywordPlace"
                        label="?????a danh"
                        rules={[
                          {
                            required: false,
                            message: 'Nh???p ?????a danh kh??ng qu?? 100 k?? t???!',
                            max: 100
                          }
                        ]}
                      >
                        <Input placeholder="?????a danh" disabled={isReceiving} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="KeywordEvent"
                        label="S??? ki???n"
                        rules={[
                          {
                            required: false,
                            message: 'Nh???p S??? ki???n kh??ng qu?? 100 k?? t???!',
                            max: 100
                          }
                        ]}
                      >
                        <Input placeholder="S??? ki???n" disabled={isReceiving} />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
                <Row gutter={20} style={{ alignItems: 'baseline' }}>
                  <Col>File m???u</Col>
                  <Col>
                    <Form.Item name="DocumentPaths">
                      <UploadFile
                        multiple
                        accept=".pdf"
                        fileList={fileList}
                        disabled={isReceiving}
                        onChange={onChangeFile}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={20}>
                  <Col span={4}>
                    <Form.Item
                      name="ConfidenceLevel"
                      label="M???c ????? tin c???y"
                      rules={[
                        () => ({
                          validator(_, value) {
                            if (value === 0) {
                              form.setFieldsValue({
                                ...form.getFieldsValue(true),
                                ConfidenceLevel: null
                              })
                            }
                            return Promise.resolve()
                          }
                        })
                      ]}
                    >
                      <Select
                        placeholder="Ch???n M???c ????? tin c???y"
                        disabled={isReceiving}
                        getPopupContainer={trigger => trigger.parentNode}
                      >
                        <Option value={0}>Kh??ng ch???n</Option>
                        <Option value={1}>B???n ch??nh</Option>
                        <Option value={2}>B???n sao</Option>
                        <Option value={3}>B???n g???c</Option>
                        <Option value={4}>B???n sao y b???n ch??nh</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item name="Format" label="T??nh tr???ng v???t l??">
                      <Select
                        placeholder="Ch???n T??nh tr???ng v???t l??"
                        disabled={isReceiving}
                        getPopupContainer={trigger => trigger.parentNode}
                      >
                        <Option value={1}>B??nh th?????ng</Option>
                        <Option value={2}>H?? h???ng</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <div className="d-flex justify-content-center">
                  <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues !== currentValues}>
                    {({ getFieldValue }) => (
                      <Space size={20}>
                        {!isObjectGuidDefault(getFieldValue('ObjectGuid')) && getFieldValue('DocStatus') === 1 && (
                          <>
                            <Button type="danger" key="deny" onClick={() => setIsOpenModalDenyReception(true)}>
                              T??? ch???i
                            </Button>
                            <Button type="primary" key="reception" onClick={() => setIsOpenModalConfirmReception(true)}>
                              Ti???p nh???n
                            </Button>
                          </>
                        )}
                        {!isObjectGuidDefault(getFieldValue('ObjectGuid')) && getFieldValue('DocStatus') !== 1 && (
                          <Button type="danger" key="delete" onClick={() => setIsOpenModalDeleteDocument(true)}>
                            X??a
                          </Button>
                        )}
                        {((!isObjectGuidDefault(getFieldValue('ObjectGuid')) && getFieldValue('DocStatus') !== 1) ||
                          isObjectGuidDefault(getFieldValue('ObjectGuid'))) && (
                          <Button type="primary" htmlType="submit">
                            Ghi l???i
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
          <ModalDeleteDocument
            visible={isOpenModalDeleteDocument}
            type="primary"
            onOk={content => onDeletePaperDocument(content)}
            onCancel={() => setIsOpenModalDeleteDocument(false)}
          />
          <ModalConfirmReception
            visible={isOpenModalConfirmReception}
            data={form.getFieldsValue(true)}
            type="primary"
            onOk={() => onReceivePaperDocument()}
            onCancel={() => setIsOpenModalConfirmReception(false)}
          />
          <ModalDenyReception
            visible={isOpenModalDenyReception}
            type="primary"
            onOk={content => onRejectPaperDocument(content)}
            onCancel={() => setIsOpenModalDenyReception(false)}
          />
        </FormAddDocumentWrapper>
      </AddDocumentWrapper>
    </>
  )
}

AddPaperDocument.propTypes = {}

export default AddPaperDocument
