import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Form, DatePicker, Row, Col, Space, Input, Spin, InputNumber, Radio, Select } from 'antd'
import { useToast } from '@chakra-ui/react'
import moment from 'moment'
import { useSelector } from 'react-redux'

// API
import FileDeliveryService from 'src/api/FileDeliveryService'

// Style
import { ModalWrapper } from 'src/components/Modals/styled/ModalWrapper'
import { FormDataMiningTitle, FormDataMiningWrapper } from 'src/components/Modals/styled/FormDataMiningWrapper'

const initialValuesForm = {
  ObjectGuid: '00000000-0000-0000-0000-000000000000',
  UnitPersonalDelivery: 0,
  PersonalDelivery: '',
  DeliveryDate: '',
  DeliveryStartDate: '',
  Title: '',
  StartDate: '',
  EndDate: '',
  NumberOfBundle: '',
  LockupTool: '',
  Description: '',
  NationalAssembly: 0,
  FilePermanent: null,
  FileLimit: null,
  Placestorage: '',
  PurPose: '',
  Type: 1,
  UnitNumberOfBundle: '',
  UnitFilePermanent: '',
  UnitFileLimit: '',
  CancelType: '',
  DeliveryInputDate: ''
}
const { Option } = Select

const CreateEditTicketDelivery = props => {
  const { visible, objectGuid, onCancel, onOk, className, width } = props
  const [form] = Form.useForm()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const { unitPersinalDelivery, nationalAssembly } = useSelector(state => state.common)
  useEffect(() => {
    if (!visible) return
    if (objectGuid) {
      getOneFileDelivery()
    }
  }, [visible])

  const disabledStartDate = current => {
    return current && current > moment(form.getFieldValue('DeliveryDate')).endOf('day')
  }

  const disabledEndDate = current => {
    return current && current < moment(form.getFieldValue('DeliveryDate')).endOf('day')
  }

  const getOneFileDelivery = () => {
    FileDeliveryService.getOne(objectGuid).then(res => {
      if (res?.isError) return
      form.setFieldsValue({
        ...res?.Object,
        UnitPersonalDelivery: res?.Object.UnitPersonalDelivery,
        PersonalDelivery: res?.Object.PersonalDelivery,
        DeliveryStartDate: moment(res?.Object?.DeliveryStartDate),
        Title: res?.Object.Title || '',
        LockupTool: res?.Object.LockupTool || '',
        Description: res?.Object.Description || '',
        NationalAssembly: res?.Object.NationalAssembly || '',
        FilePermanent: res?.Object.FilePermanent || '',
        FileLimit: res?.Object.FileLimit || '',
        Placestorage: res?.Object.Placestorage || '',
        PurPose: res?.Object.PurPose || '',
        Type: res?.Object.Type,
        UnitNumberOfBundle: res?.Object.UnitNumberOfBundle || '',
        UnitFilePermanent: res?.Object.UnitFilePermanent || '',
        UnitFileLimit: res?.Object.UnitFileLimit || '',
        CancelType: res?.Object.CancelType,
        DeliveryInputDate: moment(res?.Object.DeliveryInpDeliveryInputDateutDate) || '',
        StartDate: moment(res?.Object.StartDate) || '',
        EndDate: moment(res?.Object.EndDate) || '',
        NumberOfBundle: res?.Object.NumberOfBundle || '',
        DeliveryDate: moment(res?.Object.DeliveryDate) || ''
      })
    })
  }

  const insertUpdate = data => {
    const body = {
      ...data,
      DeliveryDate: moment(data?.DeliveryDate).format(),
      StartDate: moment(data?.StartDate).format(),
      EndDate: moment(data?.EndDate).format()
    }
    setIsLoading(false)
    FileDeliveryService.insertUpdate(body)
      .then(res => {
        if (res?.isError) return
        toast({
          title: `${
            !objectGuid
              ? 'Th??m phi???u nh???p, xu???t h??? s?? t??i li???u th??nh c??ng'
              : 'S???a phi???u nh???p, xu???t h??? s?? t??i li???u th??nh c??ng'
          }`,
          status: 'success',
          position: 'bottom-right',
          duration: 2000,
          isClosable: true
        })
        onCancel()
        onOk()
      })
      .finally(() => setIsLoading(false))
  }

  return (
    <ModalWrapper
      title={`${!objectGuid ? 'Th??m phi???u nh???p, xu???t h??? s?? t??i li???u' : 'S???a phi???u nh???p, xu???t h??? s?? t??i li???u'}`}
      visible={visible}
      onOk={onOk}
      width={width}
      onCancel={onCancel}
      className={className}
      destroyOnClose
      footer={[
        <div key="footer" className="d-flex justify-content-end">
          {/* <div>
            {objectGuid && (
              <Button type="danger" onClick={() => setIsOpenModalDeleteTicket(true)}>
                X??a
              </Button>
            )}
          </div> */}
          <Space>
            <Button type="primary" key="submit" htmlType="submit" form="formMining">
              L???p phi???u
            </Button>
            <Button type="secondary" key="back" onClick={onCancel}>
              ????ng
            </Button>
          </Space>
        </div>
      ]}
    >
      <FormDataMiningWrapper>
        <Form
          form={form}
          layout="horizontal"
          id="formMining"
          initialValues={initialValuesForm}
          onFinish={() => insertUpdate(form.getFieldsValue(true))}
          wrapperCol={{ flex: 1 }}
          colon={false}
        >
          <Spin size="small" spinning={isLoading}>
            <FormDataMiningTitle>
              <p className="top-title">PHI???U GIAO N???P H??? S??, T??I LI???U</p>
            </FormDataMiningTitle>
            <Row gutter={20}>
              <Col span={24}>
                <Form.Item
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                  name="Type"
                  label=""
                  rules={[
                    {
                      required: true,
                      message: 'Ch??a ch???n lo???i th???i h???n b???o qu???n'
                    }
                  ]}
                >
                  <Radio.Group>
                    <Radio value={1}>Giao nh???n v?? nh???p kho</Radio>
                    <Radio value={2}>Xu???t kho</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={20}>
              <Col span={24}>
                <Form.Item
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 20 }}
                  label="C?? quan, ????n v??? giao"
                  name="UnitPersonalDelivery"
                  rules={[
                    {
                      required: true,
                      message: 'Vui l??ng nh???p C?? quan, ????n v??? giao'
                    }
                  ]}
                >
                  <Select
                    placeholder="Ch???n C?? quan, ????n v??? giao"
                    getPopupContainer={trigger => trigger.parentNode}
                    showSearch
                  >
                    <Option key={0} value={0}>
                      Ch???n
                    </Option>
                    {unitPersinalDelivery &&
                      unitPersinalDelivery.length &&
                      unitPersinalDelivery.map((item, idx) => (
                        <Option key={idx} value={Number(item.CodeValue)}>
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
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 20 }}
                  label="C?? nh??n giao"
                  name="PersonalDelivery"
                  rules={[
                    {
                      required: true,
                      message: 'Vui l??ng nh???p T??n C?? nh??n giao'
                    },
                    {
                      max: 200,
                      message: 'T??n c?? nh??n giao nh??? h??n 200 k?? t???'
                    }
                  ]}
                >
                  <Input placeholder="Nh???p t??n c?? nh??n giao" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={20}>
              <Col span={12}>
                <Form.Item
                  labelCol={{ span: 8 }}
                  // wrapperCol={{ span: 20 }}
                  label="Th???i gian giao"
                  name="DeliveryStartDate"
                  rules={[
                    {
                      required: true,
                      message: 'Vui l??ng ch???n Th???i gian giao'
                    }
                  ]}
                >
                  <DatePicker
                    getPopupContainer={trigger => trigger.parentNode}
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Ch???n Th???i gian"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Th???i gian nh???p kho"
                  name="DeliveryDate"
                  rules={[
                    {
                      required: true,
                      message: 'Vui l??ng ch???n Th???i gian nh???p kho'
                    }
                  ]}
                >
                  <DatePicker
                    getPopupContainer={trigger => trigger.parentNode}
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Ch???n Th???i gian"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={0}>
              <Col span={24}>
                <Form.Item
                  labelCol={{ span: 4 }}
                  label={
                    <>
                      <p style={{ fontWeight: 600 }}>
                        N???i dung ti??u ?????
                        <br />
                        H??? s??, T??i li???u
                      </p>
                    </>
                  }
                  name="Title"
                  rules={[
                    {
                      required: true,
                      message: 'Vui l??ng nh???p N???i dung ti??u ????? H??? s??, T??i li???u'
                    },
                    {
                      max: 1000,
                      message: 'Ti??u ????? H??? s??, T??i li???u nh??? h??n 1000 k?? t???'
                    }
                  ]}
                >
                  <Input.TextArea placeholder="Nh???p N???i dung ti??u ????? H??? s??, T??i li???u" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={20}>
              <Col span={10}>
                <Form.Item label="Th???i gian H??? s?? T??i li???u: T???" name="StartDate">
                  <DatePicker
                    getPopupContainer={trigger => trigger.parentNode}
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Ch???n ng??y"
                    disabledDate={disabledStartDate}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="?????n" name="EndDate">
                  <DatePicker
                    getPopupContainer={trigger => trigger.parentNode}
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Ch???n ng??y"
                    disabledDate={disabledEndDate}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="NationalAssembly"
                  label="Qu???c h???i kh??a"
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
                    filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    placeholder="Ch???n Qu???c h???i kh??a"
                    getPopupContainer={trigger => trigger.parentNode}
                  >
                    <Option key={0} value={0}>
                      Ch???n
                    </Option>
                    {!!nationalAssembly &&
                      !!nationalAssembly.length &&
                      nationalAssembly.map((item, idx) => (
                        <Option key={idx + 1} value={Number(item.CodeValue)}>
                          {item.Text}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={20}>
              <Col span={12}>
                <Form.Item labelCol={{ span: 8 }} label="S??? l?????ng" name="NumberOfBundle">
                  <InputNumber min={0} placeholder="Nh???p s??? l?????ng" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="UnitNumberOfBundle">
                  <InputNumber min={0} placeholder="m??t" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Lo???i h???y" name="CancelType">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={20}>
              <Col span={12}>
                <Form.Item labelCol={{ span: 8 }} label="H??? s?? v??nh vi???n" name="FilePermanent">
                  <InputNumber min={0} />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="UnitFilePermanent">
                  <InputNumber min={0} placeholder="m??t" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={20}>
              <Col span={12}>
                <Form.Item labelCol={{ span: 8 }} label="H??? s?? c?? gi???i h???n" name="FileLimit">
                  <InputNumber min={0} />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="UnitFileLimit">
                  <InputNumber min={0} placeholder="m??t" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={20}>
              <Col span={24}>
                <Form.Item
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 20 }}
                  label="N??i b???o qu???n"
                  name="Placestorage"
                  rules={[
                    {
                      required: true,
                      message: 'Vui l??ng nh???p C?? quan, ????n v??? giao'
                    },
                    {
                      max: 1000,
                      message: 'N??i b???o qu???n nh??? h??n 1000 k?? t???'
                    }
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={20}>
              <Col span={24}>
                <Form.Item
                  label="C??ng c??? tra c???u"
                  name="LockupTool"
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 20 }}
                  rules={[
                    {
                      max: 1000,
                      message: 'C??ng c??? tra c???u nh??? h??n 1000 k?? t???'
                    }
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            {/* <Row gutter={20}>
              <Col span={24}>
                <Form.Item
                  label="M???c ????ch"
                  name="PurPose"
                  rules={[
                    {
                      max: 2000,
                      message: 'M???c ????ch nh??? h??n 2000 k?? t???'
                    }
                  ]}
                >
                  <Input.TextArea />
                </Form.Item>
              </Col>
            </Row> */}
            <Row gutter={20}>
              <Col span={24}>
                <Form.Item
                  label="Ghi ch??"
                  labelCol={{ span: 4 }}
                  name="Description"
                  rules={[
                    {
                      max: 2000,
                      message: 'Ghi ch?? nh??? h??n 2000 k?? t???'
                    }
                  ]}
                >
                  <Input.TextArea />
                </Form.Item>
              </Col>
            </Row>
          </Spin>
        </Form>
      </FormDataMiningWrapper>
    </ModalWrapper>
  )
}

CreateEditTicketDelivery.defaultProps = {
  width: 1000,
  className: 'atbd-modal'
}

CreateEditTicketDelivery.propTypes = {
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  visible: PropTypes.bool,
  objectGuid: PropTypes.string,
  width: PropTypes.number,
  className: PropTypes.string
}

export { CreateEditTicketDelivery }
