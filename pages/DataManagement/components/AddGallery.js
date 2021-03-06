import React, { useEffect, useState } from 'react'
import { Breadcrumb, Form, Input, Col, Row, Select, DatePicker, Radio, Button, Spin, Space, InputNumber } from 'antd'
import { useToast } from '@chakra-ui/react'
import { Link, useHistory, useParams } from 'react-router-dom'
import moment from 'moment'
import { useSelector } from 'react-redux'

// Helpers
import { getActiveLinkByPathName } from 'src/helpers/string'
import { localeVN, dateFormat } from 'src/helpers/FomatDateTime'

// Component
import { ModalDeleteDocument } from 'src/components/Modals/component/ModalDeleteDocument'

// API Service
import GalleryService from 'src/api/GalleryService'
import FileService from 'src/api/FileService'

// styled
import { BreadcrumbWrapper, AddDocumentWrapper, FormAddDocumentWrapper, BoxWrapper } from '../styled/AddDocumentWrapper'

const { Option } = Select

const initialValuesForm = {
  ObjectGuid: '00000000-0000-0000-0000-000000000000',
  OrganizationCollectCode: '',
  InforSign: '',
  StorageTimeType: 2,
  Maintenance: '',
  GalleryContent: '',
  StartDate: null,
  EndDate: null,
  FileNationalAssembly: null,
  FileCongressMeeting: null,
  FileMeeting: null,
  NationalAssembly: 0,
  CongressMeeting: 0,
  Meeting: 0,
  NegativeNo: 0,
  PositiveNo: 0,
  Description: '',
  GalleryStatus: 2,
  FileObjectGuid: '00000000-0000-0000-0000-000000000000',
  PhotoType: 1
}

function AddGallery() {
  const [form] = Form.useForm()
  const history = useHistory()
  const toast = useToast()
  const [fileName, setFileName] = useState('')
  const [fileLink, setFileLink] = useState({})

  const { FileObjectGuid, ObjectGuid } = useParams()
  const { nationalAssembly, congressMeeting, meeting } = useSelector(state => state.common)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpenModalDeleteDocument, setIsOpenModalDeleteDocument] = useState(false)
  const [fileNationalAssembly, setFileNationalAssembly] = useState(null)
  const [fileCongressMeeting, setFileCongressMeeting] = useState(null)
  const [fileMeeting, setFileMeeting] = useState(null)

  // State List QHK, KHT, PH
  const [listNationalAssembly, setListNationalAssembly] = useState([])
  const [listCongressMeeting, setListCongressMeeting] = useState([])
  const [listMeeting, setListMeeting] = useState([])

  const disabledStartDate = current => {
    return current && current > moment(form.getFieldValue('EndDate')).endOf('day')
  }

  const disabledEndDate = current => {
    return current && current < moment(form.getFieldValue('StartDate')).endOf('day')
  }

  useEffect(() => {
    setFileLink(getActiveLinkByPathName(history.location.pathname))
    if (FileObjectGuid) {
      FileService.getOne(FileObjectGuid).then(res => {
        if (res.isError) return
        setFileName(res.Object?.FileNo)
        form.setFieldsValue({
          NationalAssembly: res.Object.NationalAssembly ? res.Object.NationalAssembly : null,
          CongressMeeting: res.Object.CongressMeeting ? res.Object.CongressMeeting : null,
          Meeting: res.Object.Meeting ? res.Object.Meeting : null
        })
        if (res.Object.NationalAssembly) {
          setListNationalAssembly(
            nationalAssembly.filter(item => Number(item.CodeValue) === res.Object?.NationalAssembly)
          )
          setFileNationalAssembly(res.Object.NationalAssembly)
        }
        if (res.Object.CongressMeeting) {
          setListCongressMeeting(congressMeeting.filter(item => Number(item.CodeValue) === res.Object?.CongressMeeting))
          setFileCongressMeeting(res.Object.CongressMeeting)
        }
        if (res.Object.Meeting) {
          setListMeeting(meeting.filter(item => Number(item.CodeValue) === res.Object?.Meeting))
          setFileMeeting(res.Object.Meeting)
        }
      })
    }
    if (ObjectGuid) getGalleryByObjectGuid(ObjectGuid)
  }, [])

  const getGalleryByObjectGuid = GalleryID => {
    setIsLoading(true)
    GalleryService.getOne(GalleryID)
      .then(res => {
        if (res.isError) return
        form.setFieldsValue({
          ...res.Object,
          EndDate: moment(res.Object?.EndDate),
          StartDate: moment(res.Object?.StartDate),
          Maintenance: res?.Object?.Maintenance || ''
        })
      })
      .finally(() => setIsLoading(false))
  }

  const deleteOK = reason => {
    setIsLoading(true)
    GalleryService.delete({
      ...reason,
      ObjectGuid
    })
      .then(res => {
        if (res.isError) return
        toast({
          title: 'H??? s?? ???? b??? x??a th??nh c??ng',
          status: 'success',
          position: 'bottom-right',
          duration: 2000,
          isClosable: true
        })
        setIsOpenModalDeleteDocument(false)
        history.push(`${fileLink.url}/${FileObjectGuid}/gallery`)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const onFinish = values => {
    setIsLoading(true)
    GalleryService.insertUpdate({
      ...values,
      ObjectGuid,
      FileObjectGuid,
      GalleryStatus: 2,
      FileNationalAssembly: fileNationalAssembly,
      FileCongressMeeting: fileCongressMeeting,
      FileMeeting: fileMeeting,
      EndDate: moment(values?.EndDate).format(),
      StartDate: moment(values?.StartDate).format()
    })
      .then(res => {
        if (res.isError) return
        toast({
          title: `${ObjectGuid ? 'S???a s??u t???p ???nh th??nh c??ng' : 'Th??m m???i s??u t???p ???nh th??nh c??ng'}`,
          status: 'success',
          position: 'bottom-right',
          duration: 2000,
          isClosable: true
        })
        history.push(`${fileLink.url}/${FileObjectGuid}/gallery`)
      })
      .finally(() => setIsLoading(false))
  }

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
        {!ObjectGuid ? (
          <Breadcrumb.Item>Th??m m???i S??u t???p ???nh</Breadcrumb.Item>
        ) : (
          <Breadcrumb.Item>Xem, S???a S??u t???p ???nh</Breadcrumb.Item>
        )}
      </BreadcrumbWrapper>
      <AddDocumentWrapper>
        <FormAddDocumentWrapper>
          <Form
            layout="vertical"
            initialValues={initialValuesForm}
            form={form}
            labelAlign="left"
            onFinish={onFinish}
            scrollToFirstError={{ behavior: 'smooth', block: 'center', inline: 'center' }}
            // onValuesChange={(changedValues, allValues) => handleChange(allValues)}
          >
            <Spin size="small" spinning={isLoading}>
              <BoxWrapper>
                <Row gutter={20}>
                  <Col span={4}>
                    <Form.Item
                      label="M?? ??VBQ/ST ???nh"
                      name="OrganizationCollectCode"
                      required
                      rules={[
                        {
                          required: true,
                          message: 'M?? ??VBQ nh??? h??n 5 k?? t???',
                          max: 5
                        }
                      ]}
                    >
                      <Input placeholder="Nh???p m?? ??VBQ/ST ???nh" />
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
                <Row gutter={20}>
                  <Col span={24}>
                    <Form.Item
                      label="N???i dung STA"
                      name="GalleryContent"
                      required
                      rules={[
                        {
                          required: true,
                          message: 'Ch??a nh???p N???i dung STA'
                        },
                        {
                          max: 500,
                          message: 'Ti??u ?????  ??t h??n 500 k?? t???'
                        }
                      ]}
                    >
                      <Input.TextArea rows={3} placeholder="Nh???p n???i dung STA" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={20}>
                  <Col span={4}>
                    <Form.Item
                      name="StartDate"
                      label="Th???i gian b???t ?????u"
                      rules={[
                        {
                          required: true,
                          message: 'Ch??a nh???p Th???i gian b???t ?????u'
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
                      label="Th???i gian k???t th??c"
                      rules={[
                        {
                          required: true,
                          message: 'Th???i gian k???t th??c ph???i l???n h??n th???i gian b???t ?????u'
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
                    <Form.Item name="NegativeNo" label="S??? l?????ng phim (??m b???n)">
                      <Input disabled />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item name="PositiveNo" label="S??? l?????ng ???nh (d????ng b???n)">
                      <Input disabled />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item name="PhotoType" label="Lo???i h??nh">
                      <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode} showSearch>
                        <Option value={1}>Ch??n dung</Option>
                        <Option value={2}>Ho???t ?????ng</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={20}>
                  <Col span={4}>
                    <Form.Item name="NationalAssembly" label="Kh??a">
                      <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode} showSearch>
                        <Option key={0} value={0}>
                          Ch???n
                        </Option>
                        {listNationalAssembly &&
                          listNationalAssembly.length &&
                          listNationalAssembly.map(item => (
                            <Option key={Number(item.CodeValue)} value={Number(item.CodeValue)}>
                              {item.Text}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item name="CongressMeeting" label="K??? h???p th???">
                      <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode} showSearch>
                        <Option key={0} value={0}>
                          Ch???n
                        </Option>
                        {listCongressMeeting &&
                          listCongressMeeting.length &&
                          listCongressMeeting.map(item => (
                            <Option key={Number(item.CodeValue)} value={Number(item.CodeValue)}>
                              {item.Text}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item name="Meeting" label="Phi??n h???p">
                      <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode} showSearch>
                        <Option key={0} value={0}>
                          Ch???n
                        </Option>
                        {listMeeting &&
                          listMeeting.length &&
                          listMeeting.map(item => (
                            <Option key={Number(item.CodeValue)} value={Number(item.CodeValue)}>
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
                      name="Description"
                      label="Ghi ch??"
                      rules={[
                        {
                          required: false,
                          message: 'Ghi ch??',
                          max: 500
                        }
                      ]}
                    >
                      <Input.TextArea rows={3} placeholder="Nh???p ghi ch??" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={20}>
                  <Col span={4}>
                    <Form.Item
                      name="InforSign"
                      label="K?? hi???u th??ng tin"
                      rules={[
                        {
                          required: false,
                          message: 'Ch??a nh???p K?? hi???u th??ng tin',
                          max: 30
                        }
                      ]}
                    >
                      <Input placeholder="Nh???p k?? hi???u th??ng tin" />
                    </Form.Item>
                  </Col>
                </Row>
                <div className="d-flex justify-content-center">
                  <Space size={20}>
                    {ObjectGuid && form.getFieldValue('GalleryStatus') === 2 && (
                      <Button type="danger" onClick={() => setIsOpenModalDeleteDocument(true)}>
                        X??a
                      </Button>
                    )}
                    {((ObjectGuid && form.getFieldValue('GalleryStatus') === 2) || !ObjectGuid) && (
                      <Button type="primary" htmlType="submit">
                        Ghi l???i
                      </Button>
                    )}
                    <Button type="secondary" key="back" onClick={() => history.goBack()}>
                      Quay l???i
                    </Button>
                  </Space>
                </div>
              </BoxWrapper>
            </Spin>
          </Form>
        </FormAddDocumentWrapper>
        <ModalDeleteDocument
          visible={isOpenModalDeleteDocument}
          type="primary"
          onOk={deleteOK}
          onCancel={() => setIsOpenModalDeleteDocument(false)}
        />
      </AddDocumentWrapper>
    </>
  )
}

AddGallery.propTypes = {}

export default AddGallery
