import React, { useState, useEffect } from 'react'
import { Row, Breadcrumb, Space, Tooltip } from 'antd'

// API Service
import CalalogueService from 'src/api/CalalogueService'

// Ultis
import { formatDateVN } from 'src/helpers/FomatDateTime'
import { exportExcelURL } from 'src/helpers'

// Components
import ButtonCustom from 'src/components/Button/Button'
import Icon from 'src/components/Icon/Icon'
import TruncateText from 'src/components/TruncateText'

// style
import {
  FileCatalougeWrapper,
  BreadcrumbWrapper,
  TableHeadingWrapper,
  TableStyledWrapper
} from 'src/pages/Report/styled/FileCatalougeWrapper'

import FileCatalougeAdvanceSearchWrapper from './FileCatalougeAdvanceSearch'

const initialSearch = {
  NationalAssemblyFrom: null,
  NationalAssemblyTo: null,
  CongressMeetingFrom: null,
  CongressMeetingTo: null,
  MeetingFrom: null,
  MeetingTo: null,
  PageSize: 20,
  CurrentPage: 1,
  StartDate: null,
  EndDate: null
}
function FileCatalouge() {
  // State
  const [dataDocument, setDataDocument] = useState([])
  const [conditionSearch, setConditionSearch] = useState(initialSearch)
  const [paginationData, setPaginationData] = useState({
    CurrentPage: 1,
    PageSize: 10,
    TotalSearch: 0
  })

  // State Modal
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    getListAdvancedSearch(conditionSearch)
  }, [])

  const getListAdvancedSearch = body => {
    setConditionSearch(body)
    setIsLoading(true)
    CalalogueService.getListAdvancedSearch(body)
      .then(res => {
        if (res.isError) return
        setDataDocument(res.Object?.Data)
        setPaginationData({
          CurrentPage: res.Object.CurrentPage,
          PageSize: res.Object.PageSize,
          TotalSearch: res.Object.TotalSearch
        })
      })
      .finally(() => setIsLoading(false))
  }

  const handleChangePage = (page, pageSize) => {
    getListAdvancedSearch({
      ...conditionSearch,
      PageSize: pageSize,
      CurrentPage: page
    })
  }

  const exportFileCatalogue = () => {
    setIsLoading(true)
    CalalogueService.exportFileCatalogue({
      ...conditionSearch,
      PageSize: paginationData.TotalSearch,
      CurrentPage: 1
    })
      .then(res => {
        if (!res.isError) {
          exportExcelURL(res.Object)
          // window.open(`${process.env.REACT_APP_DOMAIN}${res.Object}`)
        }
      })
      .finally(() => setIsLoading(false))
  }

  const exportFileCatalogueDVBQ = () => {
    setIsLoading(true)
    CalalogueService.exportFileCatalogueDVBQ({
      ...conditionSearch,
      PageSize: paginationData.TotalSearch,
      CurrentPage: 1
    })
      .then(res => {
        if (!res.isError) {
          exportExcelURL(res.Object)
          // window.open(`${process.env.REACT_APP_DOMAIN}${res.Object}`)
        }
      })
      .finally(() => setIsLoading(false))
  }

  const handleChangeAdvanceSearch = allValues => {
    getListAdvancedSearch({ ...conditionSearch, ...allValues })
  }

  const columns = [
    {
      title: 'STT',
      align: 'center',
      width: 20,
      key: 'stt',
      render: (value, record, index) => <>{index + 1}</>
    },
    {
      title: 'H???p s???',
      key: 'Title',
      align: 'center',
      dataIndex: 'Gear',
      width: '5%',
      render: value => (
        <>
          <Tooltip title={`H???p s??? ${value}`} color="#2a2a2a">
            <div>{value}</div>
          </Tooltip>
        </>
      )
    },
    {
      title: (
        <>
          <div className="font-weight-bold">H??? s?? s???</div>
          <div className="font-weight-bold">
            <i>M?? h??? s??</i>
          </div>
        </>
      ),
      dataIndex: 'FileNo',
      width: '5%',
      render: (value, record) => (
        <>
          <Tooltip title={`M?? h??? s??: ${record?.FileCode}`} color="#2a2a2a">
            <div>{record?.FileNo}</div>
            <div>
              <i>{record?.FileCode}</i>
            </div>
          </Tooltip>
        </>
      )
    },
    {
      title: 'Ti??u ????? h??? s??',
      dataIndex: 'Title',
      width: '50%',
      key: 'Title',
      className: 'title',
      render: value => (
        <TruncateText maxLine={2} content={value}>
          {value}
        </TruncateText>
      )
    },
    {
      title: (
        <>
          <Tooltip title="Th???i gian b???t ?????u - k???t th??c" color="#2a2a2a">
            <div className="font-weight-bold">Th???i gian</div>
          </Tooltip>
        </>
      ),
      width: 105,
      key: 'StartDate',
      render: (value, record) => {
        return (
          <>
            <Tooltip
              title={`Th???i gian b???t ?????u:  ${formatDateVN(record.StartDate)} - Th???i gian k???t th??c: ${formatDateVN(
                record.EndDate
              )}`}
              color="#2a2a2a"
            >
              {formatDateVN(record.StartDate)} - {formatDateVN(record.EndDate)}
            </Tooltip>
          </>
        )
      }
    },
    {
      title: (
        <>
          <Tooltip title="S??? l?????ng v??n b???n" color="#2a2a2a">
            <div className="font-weight-bold">SLVB</div>
          </Tooltip>
        </>
      ),
      dataIndex: 'TotalDoc',
      key: 'TotalDoc',
      align: 'center',
      width: 90
    },
    {
      title: 'S??? t???',
      dataIndex: 'PiecesOfPaper',
      key: 'PiecesOfPaper',
      align: 'center',
      width: 150
    },
    {
      title: (
        <Tooltip title="Ch??? ????? s??? d???ng" color="#2a2a2a">
          <div className="font-weight-bold">Ch??? ????? SD</div>
        </Tooltip>
      ),
      dataIndex: 'Rights',
      key: 'Rights',
      width: '10%',
      render: value => {
        return <>{value === 1 ? 'H???n ch???' : value === 2 ? 'Kh??ng h???n ch???' : ''}</>
      }
    },
    {
      title: (
        <>
          <Tooltip title="Th???i h???n b???o qu???n" color="#2a2a2a">
            <div className="font-weight-bold">T.han b???o qu???n</div>
          </Tooltip>
        </>
      ),
      dataIndex: 'StorageTimeType',
      key: 'StorageTimeType',
      width: '10%',
      render: value => {
        return <>{value === 1 ? 'V??nh vi???n' : value === 2 ? 'C?? th???i h???n' : ''}</>
      }
    },
    {
      title: 'Ghi ch??',
      dataIndex: 'Description',
      width: '30%',
      render: value => (
        <TruncateText maxLine={2} content={value}>
          {value}
        </TruncateText>
      )
    }
  ]

  return (
    <FileCatalougeWrapper>
      <BreadcrumbWrapper>
        <Breadcrumb.Item>
          <a href="">B??o c??o th???ng k??</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <a>M???c l???c h??? s?? ph??ng L??u tr???</a>
        </Breadcrumb.Item>
      </BreadcrumbWrapper>
      <Row justify="start" className="mb-3">
        <FileCatalougeAdvanceSearchWrapper
          conditionSearch={conditionSearch}
          handleChangeAdvanceSearch={handleChangeAdvanceSearch}
        />
      </Row>
      <TableHeadingWrapper>
        <div>
          <div className="table-heading">M???c l???c h??? s?? ph??ng l??u tr???</div>
          <div>S??? b???n ghi: {paginationData.TotalSearch} </div>
        </div>
        <Space>
          <ButtonCustom
            text="Xu???t File M???c l???c"
            color="var(--color-primary)"
            icon={<Icon name="download" size={20} className="mx-auto" />}
            size={15}
            onClick={() => {
              exportFileCatalogue()
            }}
          />
          <ButtonCustom
            text="Xu???t File Th???ng k?? s??? ??VBQ"
            color="var(--color-primary)"
            icon={<Icon name="download" size={20} className="mx-auto" />}
            size={15}
            onClick={() => {
              exportFileCatalogueDVBQ()
            }}
          />
        </Space>
      </TableHeadingWrapper>

      <TableStyledWrapper
        loading={isLoading}
        columns={columns}
        dataSource={dataDocument}
        key={columns.key}
        pagination={{
          pageSize: paginationData.PageSize,
          current: paginationData.CurrentPage,
          total: paginationData.TotalSearch,
          pageSizeOptions: ['10', '20', '50', '100'],
          showSizeChanger: true,
          onChange: (page, pageSize) => handleChangePage(page, pageSize)
        }}
      />
    </FileCatalougeWrapper>
  )
}

FileCatalouge.propTypes = {}

export default FileCatalouge
