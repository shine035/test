import React, { useEffect, useState } from 'react'
import {
  Breadcrumb,
  Form,
  Input,
  InputNumber,
  Col,
  Row,
  Select,
  DatePicker,
  Radio,
  Button,
  Spin,
  Space,
  Tooltip
} from 'antd'
import { useToast } from '@chakra-ui/react'
import { Link, useHistory, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import moment from 'moment'

// API Service
import FileService from 'src/api/FileService'
import CommonService from 'src/api/CommonService'

// Components
import { ModalDeleteDocument } from 'src/components/Modals/component/ModalDeleteDocument'
import { ModalConfirmReception } from 'src/components/Modals/component/ModalConfirmReception'
import { ModalDenyReception } from 'src/components/Modals/component/ModalDenyReception'

// Helpers
import { getActiveLinkByPathName } from 'src/helpers/string'
import { localeVN, dateFormat } from 'src/helpers/FomatDateTime'

// style
import { BreadcrumbWrapper, AddDocumentWrapper, FormAddDocumentWrapper, BoxWrapper } from '../styled/AddDocumentWrapper'

const { Option } = Select

const initialValuesForm = {
  ObjectGuid: '00000000-0000-0000-0000-000000000000',
  Title: '',
  GroupFile: null,
  FileNo: '',
  FileNotation: '',
  FileCatalog: null,
  Identifier: '000.00.00.C01',
  FileCode: '',
  PiecesOfPaper: 0,
  PageNumber: 0,
  TotalDoc: '',
  StartDate: '',
  EndDate: '',
  Rights: 2,
  NationalAssemblys: [],
  StorageTimeType: 2,
  Maintenance: '',
  PersonallyFiled: '',
  DeliveryDate: '',
  Gear: '',
  Racking: 0,
  RackingValue: '',
  Compartment: 0,
  CompartmentValue: '',
  FileRowNumber: 0,
  FileRowNumberValue: '',
  InforSign: '',
  KeywordIssue: '',
  KeywordPlace: '',
  KeywordEvent: '',
  Description: '',
  FileStatus: 2,
  Format: 1,
  Languages: ['TV'],
  CongressMeeting: 0,
  Meeting: 0,
  SystemType: 1,
  SecurityLevel: 1,
  FileType: 0
}

const AddFile = () => {
  const [form] = Form.useForm()
  const history = useHistory()
  const toast = useToast()
  const { FileObjectGuid } = useParams()
  const { fileGroup, languages, nationalAssembly, congressMeeting, meeting, securityLevel } = useSelector(
    state => state.common
  )

  // State Modal
  const [isOpenModalDeleteDocument, setIsOpenModalDeleteDocument] = useState(false)
  const [isOpenModalConfirmReception, setIsOpenModalConfirmReception] = useState(false)
  const [isOpenModalDenyReception, setIsOpenModalDenyReception] = useState(false)

  // State Loading
  const [isLoading, setIsLoading] = useState(false)

  const [listRacking, setListRacking] = useState([])
  const [listCompartment, setListCompartment] = useState([])
  const [listFileRowNumber, setListFileRowNumber] = useState([])
  const [fileDetail, setFileDetail] = useState({})
  const [fileLink, setFileLink] = useState({})

  const disabledStartDate = current => {
    return current && current > moment(form.getFieldValue('EndDate')).endOf('day')
  }

  const disabledEndDate = current => {
    return current && current < moment(form.getFieldValue('StartDate')).endOf('day')
  }

  const disabledDeliveryDate = current => {
    return (
      (current && current < moment(form.getFieldValue('StartDate')).endOf('day')) ||
      current > moment(form.getFieldValue('EndDate')).endOf('day')
    )
  }

  const checkDefaultDate = date => {
    const newDate = moment(date).format('DD/MM/YYYY')
    if (newDate === '01/01/1900') {
      return true
    }
    return false
  }

  const getFileByObjectGuid = ObjectGuid => {
    if (ObjectGuid) {
      FileService.getOne(ObjectGuid).then(res => {
        if (res.isError) return
        setFileDetail(res.Object)
        form.setFieldsValue({
          ...res.Object,
          DeliveryDate: !checkDefaultDate(res.Object?.DeliveryDate) ? moment(res.Object?.DeliveryDate) : '',
          EndDate: moment(res.Object?.EndDate),
          StartDate: moment(res.Object?.StartDate),
          FileCatalog: res.Object?.FileCatalog ? res.Object?.FileCatalog.toString() : '',
          TotalDoc: res.Object?.TotalDoc ? res.Object?.TotalDoc.toString() : ''
        })
        if (res.Object.Racking) {
          getListCompartment(res.Object.Racking)
        }
        if (res?.Object?.Compartment) {
          getListFileRowNumber(res?.Object?.Compartment)
        }
      })
    }
  }

  const getInventoryByType = typeId => {
    CommonService.getInventoryByType(typeId).then(res => {
      if (res.isError) return
      if (typeId === 1) {
        setListRacking(res?.Object)
      }
    })
  }

  const handleChangeRacking = Id => {
    if (listRacking && listRacking.length) {
      const infoRacking = listRacking.find(item => item?.ID === Id)
      if (infoRacking) {
        initialValuesForm.RackingValue = infoRacking?.Value
      } else {
        initialValuesForm.RackingValue = ''
      }
    }
    getListCompartment(Id)
    getListFileRowNumber(fileDetail?.Compartment)
    if (Id !== fileDetail.Racking) {
      form.setFieldsValue({
        ...form,
        Compartment: null,
        FileRowNumber: null
      })
      initialValuesForm.CompartmentValue = ''
      initialValuesForm.FileRowNumberValue = ''
    } else {
      form.setFieldsValue({
        ...form,
        Compartment: fileDetail?.Compartment,
        FileRowNumber: fileDetail?.FileRowNumber
      })
    }
  }

  const handleChangeCompartment = Id => {
    if (listCompartment && listCompartment.length) {
      const infoCompartment = listCompartment.find(item => item?.ID === Id)
      if (infoCompartment) {
        initialValuesForm.CompartmentValue = infoCompartment?.Value
      } else {
        initialValuesForm.CompartmentValue = ''
      }
    }

    if (Id !== fileDetail.Compartment) {
      form.setFieldsValue({
        ...form,
        FileRowNumber: null
      })
      initialValuesForm.FileRowNumberValue = ''
    } else {
      form.setFieldsValue({
        ...form,
        Compartment: fileDetail?.Compartment,
        FileRowNumber: fileDetail?.FileRowNumber
      })
    }
    getListFileRowNumber(Id)
  }

  const handleChangeFileRowNumber = Id => {
    if (listFileRowNumber && listFileRowNumber.length) {
      const infoFileRowNumber = listFileRowNumber.find(item => item?.ID === Id)
      if (infoFileRowNumber) {
        initialValuesForm.FileRowNumberValue = infoFileRowNumber?.Value
      } else {
        initialValuesForm.FileRowNumberValue = ''
      }
    }
    if (!Id) {
      form.setFieldsValue({
        ...form,
        FileRowNumber: null
      })
      initialValuesForm.FileRowNumberValue = null
    }
  }

  const getListCompartment = Id => {
    if (Id) {
      CommonService.getListChildInventory(Id).then(res => {
        if (res.isError) return
        if (res?.Object && res?.Object.length) {
          setListCompartment(res?.Object.filter(item => item.ParentID === Id && item.Type === 2))
        }
      })
    }
  }

  const getListFileRowNumber = Id => {
    if (Id) {
      CommonService.getListChildInventory(Id).then(res => {
        if (res.isError) return
        if (res?.Object && res?.Object.length) {
          setListFileRowNumber(res?.Object.filter(item => item.ParentID === Id && item.Type === 3))
        }
      })
    }
  }

  const handleChange = (changedValues, allValues) => {
    if (allValues.FileNo && allValues.GroupFile) {
      form.setFieldsValue({
        ...form.getFieldsValue(true),
        FileNotation: `${allValues.FileNo}.${
          fileGroup.find(item => Number(item.CodeValue) === Number(allValues.GroupFile))?.CodeKey
        }`
      })
    }
    if (allValues.Gear) {
      form.setFieldsValue({
        ...form.getFieldsValue(true),
        Gear: allValues.Gear.replace(/\s/g, '')
      })
    }
  }

  const changeDeliveryDate = () => {
    if (moment(form.getFieldValue('StartDate')).isAfter(form.getFieldValue('DeliveryDate'), 'day')) {
      form.setFieldsValue({ DeliveryDate: null })
      form.validateFields(['DeliveryDate'])
    }
  }

  const onFinish = values => {
    setIsLoading(true)
    const body = {
      ...values,
      ObjectGuid: FileObjectGuid,
      FileStatus: 2,
      GroupFile: Number(values?.GroupFile),
      CongressMeeting: Number(values?.CongressMeeting),
      Meeting: Number(values?.Meeting),
      FileType: fileLink?.key,
      EndDate: moment(values?.EndDate).format(),
      StartDate: moment(values?.StartDate).format(),
      DeliveryDate: values?.DeliveryDate ? moment(values?.DeliveryDate).format() : '',
      RackingValue: initialValuesForm?.RackingValue || '',
      CompartmentValue: initialValuesForm?.CompartmentValue || '',
      FileRowNumberValue: initialValuesForm?.FileRowNumberValue || ''
    }
    FileService.insertUpdateFile(body)
      .then(res => {
        if (res?.isError) return
        toast({
          title: `${FileObjectGuid ? 'S???a h??? s?? th??nh c??ng' : 'Th??m m???i h??? s?? th??nh c??ng'}`,
          status: 'success',
          position: 'bottom-right',
          duration: 2000,
          isClosable: true
        })

        history.push(fileLink?.url)
      })
      .finally(() => setIsLoading(false))
  }

  const deleteOK = reason => {
    setIsLoading(true)
    FileService.delete({
      Content: reason.Content,
      ObjectGuid: FileObjectGuid
    })
      .then(res => {
        if (res.isError) return
        toast({
          title: 'H??? s?? ???? x??a th??nh c??ng',
          status: 'success',
          position: 'bottom-right',
          duration: 2000,
          isClosable: true
        })
        setIsOpenModalDeleteDocument(false)
        history.push(fileLink?.url)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const denyReceptionOK = reason => {
    setIsLoading(true)
    FileService.reject({
      ...reason,
      ObjectGuid: FileObjectGuid
    })
      .then(res => {
        if (res.isError) return
        toast({
          title: 'H??? s?? ???? b??? t??? ch???i',
          status: 'success',
          position: 'bottom-right',
          duration: 2000,
          isClosable: true
        })
        setIsOpenModalDenyReception(false)
        history.push(fileLink?.url)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const confirmOK = body => {
    setIsLoading(true)
    FileService.receive({
      ObjectGuildList: [body?.ObjectGuid]
    })
      .then(res => {
        if (res.isError) return
        toast({
          title: 'H??? s?? ???????c l??u kho',
          status: 'success',
          position: 'bottom-right',
          duration: 2000,
          isClosable: true
        })
        setIsOpenModalConfirmReception(false)
        history.push(fileLink?.url)
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    setIsLoading(true)
    setFileLink(getActiveLinkByPathName(history.location.pathname))
    Promise.all([getFileByObjectGuid(FileObjectGuid), getInventoryByType(1)])
      .then(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <AddDocumentWrapper>
      <BreadcrumbWrapper>
        <Breadcrumb.Item>Qu???n l?? d??? li???u</Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to={fileLink?.url}>{fileLink?.name}</Link>
        </Breadcrumb.Item>
        {!FileObjectGuid ? (
          <Breadcrumb.Item>Th??m m???i h??? s??</Breadcrumb.Item>
        ) : (
          <Breadcrumb.Item>Xem, S???a H??? s??</Breadcrumb.Item>
        )}
      </BreadcrumbWrapper>
      <FormAddDocumentWrapper>
        <Form
          layout="vertical"
          initialValues={initialValuesForm}
          form={form}
          id="form"
          labelAlign="left"
          scrollToFirstError={{ behavior: 'smooth', block: 'center', inline: 'center' }}
          onValuesChange={(changedValues, allValues) => handleChange(changedValues, allValues)}
          onFinish={onFinish}
        >
          <Spin size="small" spinning={isLoading}>
            <BoxWrapper>
              <div className="title-box">
                <b className="title-label">Th??ng tin c?? b???n: </b>
              </div>
              <Form.Item
                label="Ti??u ?????"
                name="Title"
                rules={[
                  {
                    required: true,
                    message: 'Vui l??ng nh???p Ti??u ????? kh??ng qu?? 1000 k?? t???!',
                    max: 1000
                  }
                ]}
              >
                <Input.TextArea rows={3} placeholder="Vui l??ng nh???p Ti??u ????? h??? s??" />
              </Form.Item>
              <Row gutter={20}>
                <Col span={4}>
                  <Form.Item name="FileCode" label="M?? h??? s??">
                    <Input placeholder="M?? h??? s??" />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    name="FileNotation"
                    label="S??? v?? k?? hi???u"
                    rules={[
                      {
                        max: 20,
                        message: 'S??? v?? k?? hi???u kh??ng qu?? 20 k?? t???'
                      }
                    ]}
                  >
                    <Input placeholder="S??? v?? k?? hi???u" />
                  </Form.Item>
                </Col>

                <Col span={4}>
                  <Form.Item name="GroupFile" label="Nh??m h??? s??">
                    <Select getPopupContainer={trigger => trigger.parentNode}>
                      <Option key={null} value={null}>
                        Ch???n
                      </Option>
                      {fileGroup &&
                        fileGroup.length &&
                        fileGroup.map((item, idx) => (
                          <Option key={idx} value={Number(item.CodeValue)}>
                            <Tooltip placement="top" title={`${item.Text} (${item.CodeKey})`}>
                              {item.Text} ({item.CodeKey})
                            </Tooltip>
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    name="FileNo"
                    label="H??? s?? s???"
                    rules={[
                      {
                        required: true,
                        message: 'Vui l??ng nh???p H??? s?? s???'
                      },
                      {
                        max: 20,
                        message: 'H??? s?? s??? kh??ng qu?? 20 k?? t???'
                      },
                      {
                        pattern: '^[a-zA-Z0-9]*$',
                        message: 'H??? s?? s??? kh??ng ch???a d???u, k?? t??? ?????c bi???t'
                      }
                    ]}
                  >
                    <Input placeholder="Nh???p s??? H??? s??" />
                  </Form.Item>
                </Col>

                <Col span={4}>
                  <Form.Item label="M???c l???c s???" name="FileCatalog">
                    <InputNumber min={0} max={99999} placeholder="M???c l???c s???" />
                  </Form.Item>
                </Col>

                <Col span={4}>
                  <Form.Item name="Identifier" label="M?? CQ l??u tr???">
                    <Select getPopupContainer={trigger => trigger.parentNode}>
                      <Option value="000.00.00.C01">000.00.00.C01</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={20}>
                <Col span={4}>
                  <Form.Item name="PiecesOfPaper" label="S??? t???">
                    <InputNumber disabled style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="PageNumber" label="S??? trang">
                    <InputNumber disabled style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="TotalDoc" label="S??? l?????ng v??n b???n">
                    <InputNumber min={0} max={999999} placeholder="S??? l?????ng v??n b???n" />
                  </Form.Item>
                </Col>
                <Col span={4}>
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
                </Col>
                <Col span={4} className="custom-col-8">
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) =>
                      prevValues.StorageTimeType !== currentValues.StorageTimeType
                    }
                  >
                    {({ getFieldValue }) =>
                      getFieldValue('StorageTimeType') === 2 ? (
                        <>
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
                    name="StartDate"
                    label="B???t ?????u"
                    rules={[
                      {
                        required: true,
                        message: 'Vui l??ng nh???p Ng??y b???t ?????u!'
                      }
                    ]}
                  >
                    <DatePicker
                      getPopupContainer={trigger => trigger.parentNode}
                      style={{ width: '100%' }}
                      locale={localeVN}
                      format={dateFormat}
                      inputReadOnly
                      disabledDate={disabledStartDate}
                    />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    name="EndDate"
                    label="K???t th??c"
                    rules={[
                      {
                        required: true,
                        message: 'Ng??y K???t th??c ph???i l???n h??n ng??y b???t ?????u!'
                      }
                    ]}
                  >
                    <DatePicker
                      getPopupContainer={trigger => trigger.parentNode}
                      style={{ width: '100%' }}
                      locale={localeVN}
                      format={dateFormat}
                      inputReadOnly
                      disabledDate={disabledEndDate}
                    />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="DeliveryDate" label="Ng??y giao">
                    <DatePicker
                      getPopupContainer={trigger => trigger.parentNode}
                      style={{ width: '100%' }}
                      format={dateFormat}
                      inputReadOnly
                      disabledDate={disabledDeliveryDate}
                      onChange={() => changeDeliveryDate()}
                    />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="Rights" label="Ch??? ????? s??? d???ng">
                    <Select getPopupContainer={trigger => trigger.parentNode}>
                      <Option value={1}>H???n ch???</Option>
                      <Option value={2}>Kh??ng h???n ch???</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    name="PersonallyFiled"
                    label="????n v???, c?? nh??n n???p"
                    rules={[
                      {
                        required: false,
                        message: '??V, c?? nh??n n???p kh??a kh??ng qu?? 200 k?? t???. Vui l??ng nh???p l???i!',
                        max: 200
                      }
                    ]}
                  >
                    <Input placeholder="????n v???, c?? nh??n n???p" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={20}>
                <Col span={4}>
                  <Form.Item name="NationalAssemblys" label="Nhi???m k???">
                    <Select
                      mode="multiple"
                      placeholder="Ch???n"
                      getPopupContainer={trigger => trigger.parentNode}
                      showSearch
                    >
                      {/* <Option key={null} value={0}>
                        Ch???n
                      </Option> */}

                      {nationalAssembly &&
                        nationalAssembly.length &&
                        nationalAssembly.map((item, idx) => (
                          <Option key={idx} value={item.CodeValue}>
                            {item.Text}
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={4} className="d-none">
                  <Form.Item name="CongressMeeting" label="K??? h???p th???">
                    <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode} showSearch>
                      <Option key={null} value={0}>
                        Ch???n
                      </Option>
                      {congressMeeting &&
                        congressMeeting.length &&
                        congressMeeting.map((item, idx) => (
                          <Option key={idx} value={Number(item.CodeValue)}>
                            {item.Text}
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={4} className="d-none">
                  <Form.Item name="Meeting" label="Phi??n h???p">
                    <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode} showSearch>
                      <Option key={null} value={0}>
                        Ch???n
                      </Option>
                      {meeting &&
                        meeting.length &&
                        meeting.map((item, idx) => (
                          <Option key={idx} value={Number(item.CodeValue)}>
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
                <b className="title-label">S??? l??u tr???: </b>
              </div>
              <Row gutter={20}>
                {/* <Col span={4}>
                  <Form.Item name="OrganID" label="M?? ph??ng">
                    AAAAAAAAA
                  </Form.Item>
                </Col> */}
                <Col span={4}>
                  <Form.Item name="FontName" label="T??n ph??ng">
                    <b>Ph??ng l??u tr???</b>
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="Racking" label="Gi??" placeholder="Ch???n">
                    <Select
                      placeholder="Ch???n"
                      onChange={value => handleChangeRacking(value)}
                      getPopupContainer={trigger => trigger.parentNode}
                    >
                      <Option key={null} value={0}>
                        Ch???n
                      </Option>
                      {listRacking &&
                        listRacking.length &&
                        listRacking.map((item, idx) => (
                          <Option key={idx} value={item.ID}>
                            {item.Description}
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="Compartment" label="Khoang" placeholder="Ch???n">
                    <Select
                      placeholder="Ch???n"
                      disabled={!form.getFieldValue('Racking')}
                      onChange={value => handleChangeCompartment(value)}
                      getPopupContainer={trigger => trigger.parentNode}
                    >
                      <Option key={null} value={0}>
                        Ch???n
                      </Option>
                      {listCompartment &&
                        listCompartment.length &&
                        listCompartment.map((item, idx) => (
                          <Option key={idx} value={Number(item.ID)}>
                            {item.Description}
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    name="FileRowNumber"
                    label="H??ng"
                    rules={[
                      {
                        required: false,
                        message: 'H??ng kh??ng qu?? 20 k?? t???!'
                      }
                    ]}
                  >
                    <Select
                      placeholder="Ch???n"
                      disabled={!form.getFieldValue('Compartment')}
                      onChange={value => handleChangeFileRowNumber(value)}
                      getPopupContainer={trigger => trigger.parentNode}
                    >
                      <Option key={null} value={0}>
                        Ch???n
                      </Option>
                      {listFileRowNumber &&
                        listFileRowNumber.length &&
                        listFileRowNumber.map((item, idx) => (
                          <Option key={idx} value={item.ID}>
                            {item.Description}
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    name="Gear"
                    label="H???p s???"
                    rules={[
                      {
                        message: 'Vui l??ng nh???p H???p s??? kh??ng qu?? 20 k?? t???',
                        max: 20
                      },
                      {
                        pattern: '^[a-zA-Z0-9]*$',
                        message: 'H???p s??? kh??ng ch???a d???u, k?? t??? ?????c bi???t'
                      }
                    ]}
                  >
                    <Input placeholder="Nh???p h???p s???" />
                  </Form.Item>
                </Col>
                {/* </Row>
              <Row gutter={20}> */}
              </Row>
            </BoxWrapper>
            <BoxWrapper>
              <div className="title-box">
                <b className="title-label">Th??ng tin kh??c: </b>
              </div>
              <Row gutter={20}>
                <Col span={8}>
                  <Form.Item
                    name="InforSign"
                    label="K?? hi???u th??ng tin"
                    rules={[
                      {
                        required: false,
                        message: 'Nh???p K?? hi???u th??ng tin kh??ng qu?? 30 k?? t???!',
                        max: 30
                      }
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={16}>
                  <Form.Item name="Languages" label="Ng??n ng???">
                    <Select
                      mode="multiple"
                      allowClear
                      showSearch
                      showArrow
                      placeholder="Ch???n ng??n ng???"
                      getPopupContainer={trigger => trigger.parentNode}
                      filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    >
                      {languages &&
                        languages.length &&
                        languages.map((item, idx) => (
                          <Option key={idx} value={item.CodeKey}>
                            {item.Text}
                          </Option>
                        ))}
                    </Select>
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
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="KeywordPlace"
                      label="?????a danh"
                      rules={[
                        {
                          required: false,
                          message: '?????a danh kh??ng qu?? 100 k?? t???. Vui l??ng nh???p l???i!',
                          max: 100
                        }
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="KeywordEvent"
                      label="S??? ki???n"
                      rules={[
                        {
                          required: false,
                          message: 'S??? ki???n kh??ng qu?? 100 k?? t???. Vui l??ng nh???p l???i!',
                          max: 100
                        }
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
              <Row>
                <Col span={24}>
                  <Form.Item
                    label="Ch?? gi???i"
                    name="Description"
                    rules={[
                      {
                        required: false,
                        message: 'Ch?? gi???i kh??ng qu?? 2000 k?? t???. Vui l??ng nh???p l???i!',
                        max: 2000
                      }
                    ]}
                  >
                    <Input.TextArea rows={4} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={20}>
                <Col span={4}>
                  <Form.Item name="Format" label="T??nh tr???ng v???t l??">
                    <Select getPopupContainer={trigger => trigger.parentNode}>
                      <Option value={1}>B??nh th?????ng</Option>
                      <Option value={2}>H?? h???ng</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="SecurityLevel" label="????? m???t">
                    <Select disabled getPopupContainer={trigger => trigger.parentNode}>
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
            </BoxWrapper>
            <div className="d-flex justify-content-center">
              <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues !== currentValues}>
                {({ getFieldValue }) => (
                  <Space size={20}>
                    {FileObjectGuid && getFieldValue('FileStatus') === 1 && (
                      <>
                        <Button type="danger" onClick={() => setIsOpenModalDenyReception(true)}>
                          T??? ch???i
                        </Button>
                        <Button type="primary" onClick={() => setIsOpenModalConfirmReception(true)}>
                          Ti???p nh???n
                        </Button>
                      </>
                    )}
                    {FileObjectGuid && (
                      <Button type="danger" onClick={() => setIsOpenModalDeleteDocument(true)}>
                        X??a
                      </Button>
                    )}
                    <Button type="primary" htmlType="submit">
                      Ghi l???i
                    </Button>
                    <Button type="secondary" key="back" onClick={() => history.goBack()}>
                      Quay l???i
                    </Button>
                  </Space>
                )}
              </Form.Item>
            </div>
          </Spin>
        </Form>

        <ModalDeleteDocument
          visible={isOpenModalDeleteDocument}
          type="primary"
          onOk={deleteOK}
          onCancel={() => setIsOpenModalDeleteDocument(false)}
        />
        <ModalConfirmReception
          visible={isOpenModalConfirmReception}
          type="primary"
          data={fileDetail}
          onOk={() => confirmOK(fileDetail)}
          onCancel={() => setIsOpenModalConfirmReception(false)}
        />

        <ModalDenyReception
          visible={isOpenModalDenyReception}
          type="primary"
          onOk={denyReceptionOK}
          onCancel={() => setIsOpenModalDenyReception(false)}
        />
      </FormAddDocumentWrapper>
    </AddDocumentWrapper>
  )
}

AddFile.propTypes = {}

export default AddFile
