import React, { useState, useEffect } from 'react'
// Component
import SystemAdvanceSearchFileAndDocWrapper from 'src/pages/Report/components/SystemAdvanSearchFileAndDocWrapper'
import TruncateText from 'src/components/TruncateText'

// API Services
import GeneralStatisticService from 'src/api/GeneralStatistic'

// Ultis
import { formatDateVN } from 'src/helpers/FomatDateTime'

// Style
import { TableStyledFileAnDocWrapper } from 'src/pages/Report/styled/newFileDoc'
import { ProfileStatisticsWrapper } from '../styled'

const initialSearch = {
  StatisticType: 2,
  DateType: 2,
  PageSize: 20,
  CurrentPage: 1,
  SystemType: 0
}

function DocumentStatistics() {
  const [isLoading, setIsLoading] = useState(false)
  const [conditionSearch, setConditionSearch] = useState(initialSearch)
  const [profileStatistic, setProfileStatistic] = useState([])
  const [paginationData, setPaginationData] = useState({ CurrentPage: 1, PageSize: 20, TotalSearch: 0 })

  const GetListProfileStatistic = newConditionSearch => {
    setConditionSearch(newConditionSearch)
    setIsLoading(true)
    GeneralStatisticService.GetNewFileAndDocStatistic(newConditionSearch)
      .then(res => {
        if (!res.isError && !res.Status) {
          setProfileStatistic(res.Object?.Data)
          setPaginationData({
            CurrentPage: res.Object.CurrentPage,
            PageSize: res.Object.PageSize,
            TotalSearch: res.Object.TotalSearch
          })
        }
      })
      .finally(() => setIsLoading(false))
  }

  const handleEasySearch = value => {
    const newConditionSearch = {
      ...conditionSearch,
      DateType: value.DateType,
      SystemType: value.SystemType
    }
    GetListProfileStatistic(newConditionSearch)
  }

  const handleChangePage = (page, pageSize) => {
    const body = { ...conditionSearch, PageSize: pageSize, CurrentPage: page }
    GetListProfileStatistic(body)
  }

  const columns = [
    {
      title: 'STT',
      align: 'center',
      render: (value, record, index) => <>{index + 1}</>,
      width: 50
    },
    {
      title: 'Ti??u ????? h??? s??',
      dataIndex: 'Title',
      align: 'left',
      width: '40%',
      render: value => (
        <TruncateText maxLine={2} content={value}>
          {value}
        </TruncateText>
      )
    },
    { title: 'S???  v?? k?? hi???u', dataIndex: 'FileNotation', align: 'left', width: 120 },
    { title: 'H??? s?? s???', dataIndex: 'FileNo', align: 'left', width: 80 },
    {
      title: 'H??? th???ng',
      dataIndex: 'System',
      align: 'left',
      width: 80
    },
    {
      title: 'Ng??y n???p',
      render: (value, record) => {
        return <>{formatDateVN(record.CreateDate)}</>
      },
      align: 'left',
      width: 80
    }
  ]

  useEffect(() => {
    const newConditionSearch = {
      ...conditionSearch
    }
    GetListProfileStatistic(newConditionSearch)
  }, [])

  return (
    <ProfileStatisticsWrapper>
      <div className="style-advances-search">
        <div className="style-record">S??? B???N GHI : {paginationData.TotalSearch}</div>
        <SystemAdvanceSearchFileAndDocWrapper conditionSearch={conditionSearch} handleEasySearch={handleEasySearch} />
      </div>
      <TableStyledFileAnDocWrapper
        loading={isLoading}
        columns={columns}
        dataSource={profileStatistic}
        pagination={{
          pageSize: paginationData.PageSize,
          current: paginationData.CurrentPage,
          total: paginationData.TotalSearch,
          pageSizeOptions: ['10', '20', '50', '100'],
          showSizeChanger: true,
          locale: { items_per_page: '' },
          onChange: (page, pageSize) => handleChangePage(page, pageSize)
        }}
      />
    </ProfileStatisticsWrapper>
  )
}

DocumentStatistics.propTypes = {}

export default DocumentStatistics
