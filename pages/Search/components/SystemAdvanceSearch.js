import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Row, Col, Select, DatePicker, Tooltip, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import FadeIn from 'react-fade-in'
import { useSelector } from 'react-redux'
import moment from 'moment'
// Components
import Icon from 'src/components/Icon/Icon'
import ButtonCustom from 'src/components/Button/Button'

// Helpers
import { localeVN, dateFormat } from 'src/helpers/FomatDateTime'

// Styled Component
import { SystemAdvanceSearchWrapper, SearchEasyWrapper } from '../styled/SearchWrapper'

const { Option } = Select
const { Search } = Input

function SystemAdvanceSearch({ conditionSearch, handleChangeEasySearch, handleChangeAdvanceSearch }) {
  const [form] = Form.useForm()
  const { documentTypes, fileGroup, nationalAssembly, congressMeeting, meeting } = useSelector(state => state.common)
  const [isShowAdvanceSearch, setIsShowAdvanceSearch] = useState(false)
  const [isChangeAdvanceSearch, setIsChangeAdvanceSearch] = useState(false)

  const disabledStartDate = current => {
    return current && current > moment(form.getFieldValue('CreateDateTo')).endOf('day')
  }

  const disabledEndDate = current => {
    return current && current < moment(form.getFieldValue('CreateDateFrom')).endOf('day')
  }

  useEffect(() => {
    if (!isShowAdvanceSearch && isChangeAdvanceSearch) {
      form.setFieldsValue({
        ...conditionSearch,
        NationalAssemblyFrom: 0,
        NationalAssemblyTo: 0,
        CongressMeetingFrom: 0,
        CongressMeetingTo: 0,
        MeetingFrom: 0,
        MeetingTo: 0,
        GroupFile: 0,
        FileStatus: 0,
        RefType: 0,
        TypeName: 0,
        CreateDateFrom: '',
        CreateDateTo: '',
        PageSize: 20,
        CurrentPage: 1
      })
      setIsChangeAdvanceSearch(false)
      handleChangeAdvanceSearch(form.getFieldsValue(true))
    }
  }, [isShowAdvanceSearch])

  return (
    <SystemAdvanceSearchWrapper>
      <SearchEasyWrapper>
        <Row justify="space-between" className="mb-0">
          <Col flex="1 1 auto" className="mr-2">
            <Search
              defaultValue={conditionSearch.TextSearch}
              placeholder="M?? h??? s??, H??? s?? s???, S??? v?? k?? hi???u h??? s??, Ti??u ????? h??? s??, S??? v?? k?? hi???u t??i li???u, S??? l??u tr???, Ti??u ????? t??i li???u, Tr??ch y???u t??i li???u, M?? STA, N???i dung STA"
              enterButton={<SearchOutlined style={{ fontSize: '24px' }} />}
              onSearch={value => handleChangeEasySearch(value)}
            />
          </Col>
          <Tooltip title="" color="#2a2a2a" placement="left">
            <ButtonCustom
              text={!isShowAdvanceSearch ? 'M??? b??? l???c n??ng cao' : '????ng b??? l???c n??ng cao'}
              type="primary"
              size={15}
              color="var(--color-primary)"
              icon={
                <Icon name={!isShowAdvanceSearch ? 'filter_alt' : 'keyboard_arrow_up'} size={20} className="mx-auto" />
              }
              onClick={() => {
                setIsChangeAdvanceSearch(true)
                setIsShowAdvanceSearch(!isShowAdvanceSearch)
              }}
            />
          </Tooltip>
        </Row>
      </SearchEasyWrapper>
      <Form
        layout="vertical"
        form={form}
        labelAlign="left"
        name="basic"
        initialValues={conditionSearch}
        onValuesChange={(changedValues, allValues) => {
          setIsChangeAdvanceSearch(true)
          handleChangeAdvanceSearch(allValues)
        }}
      >
        {isShowAdvanceSearch && (
          <FadeIn>
            <Row justify="start" gutter="16">
              <Col span={4}>
                <Form.Item name="GroupFile" label="Nh??m h??? s??">
                  <Select showArrow placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode}>
                    <Option value={0}>T???t c???</Option>
                    {fileGroup &&
                      fileGroup.length &&
                      fileGroup.map(item => (
                        <Option key={Number(item.CodeValue)} value={Number(item.CodeValue)}>
                          <Tooltip title={`${item.Text} (${item.CodeKey})`}>
                            {item.Text} ({item.CodeKey})
                          </Tooltip>
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item label="Lo???i t??i li???u" name="RefType">
                  <Select showArrow getPopupContainer={trigger => trigger.parentNode}>
                    <Option value={0}>T???t c???</Option>
                    <Option value={1}>
                      <Tooltip title="T??i li???u gi???y">T??i li???u gi???y</Tooltip>
                    </Option>
                    <Option value={2}>
                      <Tooltip title="T??i li???u phim(??m b???n)/???nh">T??i li???u phim(??m b???n)/???nh</Tooltip>
                    </Option>
                    <Option value={3}>
                      <Tooltip title="T??i li???u phim, ??m thanh">T??i li???u phim, ??m thanh</Tooltip>
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Lo???i v??n b???n" name="TypeName">
                  <Select getPopupContainer={trigger => trigger.parentNode}>
                    <Option value={0}>T???t c???</Option>
                    {documentTypes &&
                      documentTypes.length &&
                      documentTypes.map(item => (
                        <Option key={Number(item.CodeValue)} value={Number(item.CodeValue)}>
                          {item.Text}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="Tr???ng th??i" name="FileStatus">
                  <Select>
                    <Option value={0}>T???t c???</Option>
                    <Option value={2}>Kh??? d???ng</Option>
                    <Option value={3}>??ang khai th??c</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="NationalAssemblyFrom"
                  label="Kh??a t???"
                  dependencies={['NationalAssemblyTo']}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (
                          !value &&
                          getFieldValue('NationalAssemblyFrom') > getFieldValue('NationalAssemblyTo') &&
                          getFieldValue('NationalAssemblyTo')
                        ) {
                          return Promise.reject(new Error(`Ch???n Kh??a <= ${getFieldValue('NationalAssemblyTo') || 0}`))
                        }
                        return Promise.resolve()
                      }
                    })
                  ]}
                >
                  <Select>
                    <Option value={0}>T???t c???</Option>
                    {!!nationalAssembly &&
                      !!nationalAssembly.length &&
                      nationalAssembly.map(item => (
                        <Option key={Number(item.CodeValue)} value={Number(item.CodeValue)}>
                          {item.Text}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="NationalAssemblyTo"
                  label="?????n"
                  dependencies={['NationalAssemblyFrom']}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (
                          (!value || getFieldValue('NationalAssemblyFrom') > getFieldValue('NationalAssemblyTo')) &&
                          getFieldValue('NationalAssemblyTo')
                        ) {
                          return Promise.reject(new Error(`Ch???n kh??a t??? nh??? h??n ?????n`))
                        }
                        return Promise.resolve()
                      }
                    })
                  ]}
                >
                  <Select>
                    <Option value={0}>T???t c???</Option>
                    {!!nationalAssembly &&
                      !!nationalAssembly.length &&
                      nationalAssembly.map(item => (
                        <Option key={Number(item.CodeValue)} value={Number(item.CodeValue)}>
                          {item.Text}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="CongressMeetingFrom"
                  label="K??? h???p th??? t???"
                  dependencies={['CongressMeetingTo']}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (
                          !value &&
                          getFieldValue('CongressMeetingFrom') > getFieldValue('CongressMeetingTo') &&
                          getFieldValue('CongressMeetingTo')
                        ) {
                          return Promise.reject(new Error(`Ch???n K??? h???p th??? t??? nh??? h??n ?????n`))
                        }
                        return Promise.resolve()
                      }
                    })
                  ]}
                >
                  <Select>
                    <Option value={0}>T???t c???</Option>
                    {!!congressMeeting &&
                      !!congressMeeting.length &&
                      congressMeeting.map(item => (
                        <Option key={Number(item.CodeValue)} value={Number(item.CodeValue)}>
                          {item.Text}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="CongressMeetingTo"
                  label="?????n"
                  dependencies={['CongressMeetingFrom']}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (
                          (!value || getFieldValue('CongressMeetingFrom') > getFieldValue('CongressMeetingTo')) &&
                          getFieldValue('CongressMeetingTo')
                        ) {
                          return Promise.reject(new Error(`Ch???n K??? h???p th??? t??? nh??? h??n ?????n`))
                        }
                        return Promise.resolve()
                      }
                    })
                  ]}
                >
                  <Select>
                    <Option value={0}>T???t c???</Option>
                    {!!congressMeeting &&
                      !!congressMeeting.length &&
                      congressMeeting.map(item => (
                        <Option key={Number(item.CodeValue)} value={Number(item.CodeValue)}>
                          {item.Text}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="MeetingFrom"
                  label="Phi??n h???p th??? t???"
                  dependencies={['MeetingTo']}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (
                          !value &&
                          getFieldValue('MeetingFrom') > getFieldValue('MeetingTo') &&
                          getFieldValue('MeetingTo')
                        ) {
                          return Promise.reject(new Error(`Ch???n Phi??n h???p th??? <= ${getFieldValue('MeetingTo') || 0}`))
                        }
                        return Promise.resolve()
                      }
                    })
                  ]}
                >
                  <Select>
                    <Option value={0}>T???t c???</Option>
                    {!!meeting &&
                      !!meeting.length &&
                      meeting.map(item => (
                        <Option key={Number(item.CodeValue)} value={Number(item.CodeValue)}>
                          {item.Text}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="MeetingTo"
                  label="?????n"
                  dependencies={['MeetingFrom']}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (
                          (!value || getFieldValue('MeetingFrom') > getFieldValue('MeetingTo')) &&
                          getFieldValue('MeetingTo')
                        ) {
                          return Promise.reject(new Error(`Ch???n Phi??n h???p th??? t??? nh??? h??n ?????n`))
                        }
                        return Promise.resolve()
                      }
                    })
                  ]}
                >
                  <Select>
                    <Option value={0}>T???t c???</Option>
                    {!!meeting &&
                      !!meeting.length &&
                      meeting.map(item => (
                        <Option key={Number(item.CodeValue)} value={Number(item.CodeValue)}>
                          {item.Text}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="CreateDateFrom" label="Th???i gian t???">
                  <DatePicker
                    getPopupContainer={trigger => trigger.parentNode}
                    inputReadOnly
                    style={{ width: '100%' }}
                    locale={localeVN}
                    format={dateFormat}
                    disabledDate={disabledStartDate}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="CreateDateTo" label="?????n">
                  <DatePicker
                    getPopupContainer={trigger => trigger.parentNode}
                    inputReadOnly
                    style={{ width: '100%' }}
                    locale={localeVN}
                    format={dateFormat}
                    disabledDate={disabledEndDate}
                  />
                </Form.Item>
              </Col>
            </Row>
          </FadeIn>
        )}
      </Form>
    </SystemAdvanceSearchWrapper>
  )
}

SystemAdvanceSearch.propTypes = {
  conditionSearch: PropTypes.object,
  handleChangeEasySearch: PropTypes.func,
  handleChangeAdvanceSearch: PropTypes.func
}

export default SystemAdvanceSearch
