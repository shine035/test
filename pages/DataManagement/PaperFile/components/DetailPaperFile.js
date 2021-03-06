import React, { useState, useEffect } from 'react'
import { useHistory, useParams, Link } from 'react-router-dom'
import { Breadcrumb, Menu } from 'antd'

// API Service
import FileService from 'src/api/FileService'
import GalleryService from 'src/api/GalleryService'

// Component
import FilmCategory from 'src/pages/DataManagement/components/FilmCategory'
import PaperCategory from 'src/pages/DataManagement/components/PaperCategory'
import Gallery from 'src/pages/DataManagement/components/Gallery'
import PhotoDocument from 'src/pages/DataManagement/components/PhotoDocument'

// Styled Component
import { DataManagementWrapper, BreadcrumbWrapper } from 'src/pages/DataManagement/styled/DataManagementWrapper'

DetailPaperFile.propTypes = {}

DetailPaperFile.defaultProps = {}
function DetailPaperFile() {
  const { FileObjectGuid, tabActive, GalleryObjectGuid } = useParams()
  const history = useHistory()

  // State
  const [current, setCurrent] = useState(tabActive)
  const [fileName, setFileName] = useState('')
  const [galleryName, setGalleryName] = useState('')
  const [totalPaper, setTotalPaper] = useState(0)
  const [totalGallery, setTotalGallery] = useState(0)
  const [totalFilm, setTotalFilm] = useState(0)

  const handleClick = e => {
    setCurrent(e.key)
    history.push(`/paper-file/${FileObjectGuid}/${e.key}`)
  }

  const getFileByObjectGuid = () => {
    FileService.getOne(FileObjectGuid).then(res => {
      if (res?.isError) return
      setFileName(res.Object?.FileNo)
    })
  }

  const getGalleryByObjectGuid = () => {
    GalleryService.getOne(GalleryObjectGuid).then(res => {
      if (res?.isError) return
      setGalleryName(res?.Object?.OrganizationCollectCode)
    })
  }

  const getTotalDocFilmGalleryByFile = () => {
    FileService.countDocFilmGalleryByFile(FileObjectGuid).then(res => {
      if (res?.isError) return
      setTotalPaper(res?.Object?.DocTotal)
      setTotalGallery(res?.Object?.GalleryTotal)
      setTotalFilm(res?.Object?.FilmTotal)
    })
  }

  useEffect(() => {
    if (GalleryObjectGuid) {
      getGalleryByObjectGuid()
    }
  }, [GalleryObjectGuid])

  useEffect(() => {
    Promise.all([getFileByObjectGuid(), getTotalDocFilmGalleryByFile()])
  }, [])

  return (
    <DataManagementWrapper>
      <BreadcrumbWrapper>
        <Breadcrumb.Item>Qu???n l?? d??? li???u</Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/paper-file">Danh s??ch h??? s??</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item> H??? s?? {fileName}</Breadcrumb.Item>
        <Breadcrumb.Item>
          {tabActive === 'paper'
            ? 'T??i li???u gi???y'
            : tabActive === 'gallery'
            ? 'S??u t???p ???nh'
            : tabActive === 'film'
            ? 'T??i li???u phim, ??m thanh'
            : ''}
        </Breadcrumb.Item>
        {GalleryObjectGuid && <Breadcrumb.Item>{galleryName}</Breadcrumb.Item>}
        {GalleryObjectGuid && <Breadcrumb.Item>T??i li???u ???nh</Breadcrumb.Item>}
      </BreadcrumbWrapper>
      <Menu onClick={e => handleClick(e)} selectedKeys={[current]} mode="horizontal">
        <Menu.Item key="paper">T??i li???u gi???y ({totalPaper})</Menu.Item>
        <Menu.Item key="gallery">S??u t???p ???nh ({totalGallery})</Menu.Item>
        <Menu.Item key="film">T??i li???u phim, ??m thanh ({totalFilm})</Menu.Item>
      </Menu>
      {current === 'paper' ? (
        <PaperCategory />
      ) : current === 'gallery' ? (
        GalleryObjectGuid ? (
          <PhotoDocument />
        ) : (
          <Gallery />
        )
      ) : current === 'film' ? (
        <FilmCategory />
      ) : (
        ''
      )}
    </DataManagementWrapper>
  )
}

export default DetailPaperFile
