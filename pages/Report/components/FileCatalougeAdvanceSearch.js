import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Row, Col, Select, DatePicker } from 'antd'
import { useSelector } from 'react-redux'
import moment from 'moment'

// Helpers
import { localeVN, dateFormat } from 'src/helpers/FomatDateTime'

// Style
import { FileCatalougeAdvanceSearchWrapper } from '../styled/FileCatalougeWrapper'

const { Option } = Select
function FileCatalougeAdvanceSearch({ handleChangeAdvanceSearch, conditionSearch }) {
  const [form] = Form.useForm()
  const { nationalAssembly, congressMeeting, meeting } = useSelector(state => state.common)
  const [listNationalAssemblyTo, setListNationalAssemblyTo] = useState(nationalAssembly)
  const [listCongressMeetingTo, setListCongressMeetingTo] = useState(congressMeeting)
  const [listMeetingTo, setListMeetingTo] = useState(meeting)

  const handleChange = value => {
    if (value.NationalAssemblyFrom) {
      setListNationalAssemblyTo(
        nationalAssembly.filter(item => Number(item.CodeValue) > Number(form.getFieldValue('NationalAssemblyFrom')))
      )
    }
    if (value.CongressMeetingFrom) {
      setListCongressMeetingTo(
        congressMeeting.filter(item => Number(item.CodeValue) > Number(form.getFieldValue('CongressMeetingFrom')))
      )
    }
    if (value.MeetingFrom) {
      setListMeetingTo(meeting.filter(item => Number(item.CodeValue) > Number(form.getFieldValue('MeetingFrom'))))
    }
    const bodySearch = { ...conditionSearch, ...value }
    handleChangeAdvanceSearch(bodySearch)
  }
  const disabledStartDate = current => {
    return current && current > moment(form.getFieldValue('EndDate')).endOf('day')
  }

  const disabledEndDate = current => {
    return current && current < moment(form.getFieldValue('StartDate')).endOf('day')
  }

  return (
    <FileCatalougeAdvanceSearchWrapper>
      <Form
        name="basic"
        form={form}
        layout="vertical"
        initialValues={conditionSearch}
        onValuesChange={(changedValues, allValues) => handleChange(allValues)}
      >
        <Row justify="start" gutter="16">
          <Col span={4}>
            <Form.Item label="QHK: " name="NationalAssemblyFrom">
              <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode}>
                <Option value={null}>T???t c???</Option>
                {nationalAssembly &&
                  nationalAssembly.length &&
                  nationalAssembly.map((item, idx) => (
                    <Option key={idx} value={Number(item.CodeValue)}>
                      Kh??a {item.Text}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="?????n: " name="NationalAssemblyTo">
              <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode}>
                <Option value={null}>T???t c???</Option>
                {listNationalAssemblyTo &&
                  listNationalAssemblyTo.length &&
                  listNationalAssemblyTo.map((item, idx) => (
                    <Option key={idx} value={Number(item.CodeValue)}>
                      Kh??a {item.Text}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="K??? h???p th???: " name="CongressMeetingFrom">
              <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode}>
                <Option value={null}>T???t c???</Option>
                {congressMeeting &&
                  congressMeeting.length &&
                  congressMeeting.map((item, idx) => (
                    <Option key={idx} value={Number(item.CodeValue)}>
                      K??? h???p th??? {item.Text}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="?????n:" name="CongressMeetingTo">
              <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode}>
                <Option value={null}>T???t c???</Option>
                {listCongressMeetingTo &&
                  listCongressMeetingTo.length &&
                  listCongressMeetingTo.map((item, idx) => (
                    <Option key={idx} value={Number(item.CodeValue)}>
                      K??? h???p th??? {item.Text}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="Phi??n h???p:" name="MeetingFrom">
              <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode}>
                <Option value={null}>T???t c???</Option>
                {meeting &&
                  meeting.length &&
                  meeting.map((item, idx) => (
                    <Option key={idx} value={Number(item.CodeValue)}>
                      Phi??n h???p th??? {item.Text}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="?????n: " name="MeetingTo">
              <Select placeholder="Ch???n" getPopupContainer={trigger => trigger.parentNode}>
                <Option value={null}>T???t c???</Option>
                {listMeetingTo &&
                  listMeetingTo.length &&
                  listMeetingTo.map((item, idx) => (
                    <Option key={idx} value={Number(item.CodeValue)}>
                      Phi??n h???p th??? {item.Text}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="Th???i gian t???: " name="StartDate">
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
            <Form.Item label="?????n: " name="EndDate">
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
        </Row>
      </Form>
    </FileCatalougeAdvanceSearchWrapper>
  )
}

FileCatalougeAdvanceSearch.propTypes = {
  conditionSearch: PropTypes.object,
  handleChangeAdvanceSearch: PropTypes.func
}

export default FileCatalougeAdvanceSearch
