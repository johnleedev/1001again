import { useEffect, useState } from 'react';
import axios from 'axios';
import MainURL from '../MainURL';
import './Admin.scss';

import { PiPencilSimpleLineFill } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';

export default function Backup (props:any) {

	let navigate = useNavigate();
	const userName = sessionStorage.getItem('userName');


	
	// 게시글 가져오기 ------------------------------------------------------
	const [refresh, setRefresh] = useState(true);
	const [list, setList] = useState<any>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);

	const fetchPosts = async () => {
		axios.get(`${MainURL}/backup/getdatas`)
			.then((res)=>{
					if (res.data !== false && Array.isArray(res.data)) {
						console.log(res.data);
						setList(res.data);
					} else {
						setList([]);
					}
						
			})
			.catch((err)=>{
					console.error('상품 데이터 조회 오류:', err);
					setList([]);
			});
		};


	useEffect(() => {
		
		fetchPosts();
		
	}, [refresh, currentPage]);

	const register = async () => {
		if (!Array.isArray(list) || list.length === 0) {
			alert('저장할 데이터가 없습니다.');
			return;
		}

		// mainService, facility -> 별도 테이블 저장
		const payload = {
			mainService: [],
			facility: []
		} as { mainService: any[]; facility: any[]; };

		try {
			// 현재 mainInfo는 단일 row 가정
			const item = list[0] || {};
			// mainService 파싱
			try {
				const parsed = typeof item.mainService === 'string' ? JSON.parse(item.mainService) : item.mainService;
				if (Array.isArray(parsed)) payload.mainService = parsed;
			} catch (e) {
				console.error('mainService 파싱 오류:', e);
			}
			// facility 파싱
			try {
				const parsed = typeof item.facility === 'string' ? JSON.parse(item.facility) : item.facility;
				if (Array.isArray(parsed)) payload.facility = parsed;
			} catch (e) {
				console.error('facility 파싱 오류:', e);
			}

			if (payload.mainService.length === 0 && payload.facility.length === 0) {
				alert('저장할 mainService/facility 데이터가 없습니다.');
				return;
			}

			const res = await axios.post(`${MainURL}/backup/savemainimages`, payload);
			if (res.data && res.data.success) {
				alert(`저장되었습니다.\n서비스: ${res.data.service?.successCount || 0}/${res.data.service?.totalCount || 0}\n시설: ${res.data.facility?.successCount || 0}/${res.data.facility?.totalCount || 0}`);
				setRefresh(!refresh);
			} else {
				alert(`저장에 실패했습니다.\n${res.data?.message || ''}`);
			}
		} catch (error:any) {
			console.error('mainService/facility 저장 실패:', error);
			alert(error.response?.data?.message || '저장 중 오류가 발생했습니다.');
		}
	};


	return ( 
		<div className='Main-cover'>

			<div className="main-title">
				<div className='title-box'>
					<h1>백업관리</h1>
				</div>
        <div className="addBtn"
					onClick={()=>{
						register();
					}}
				>
					<PiPencilSimpleLineFill />
					<p>저장</p>
				</div>
				
			</div>
			
		
				
			<div className="seachlist">


				<div className="main-list-cover">
					{
						Array.isArray(list) && list.length > 0
						?
						list.map((item:any, index:any)=>{
							// images 필드 파싱 시도
							let imagesCount = 0;
							let imagesArray: any[] = [];
							try {
								if (typeof item.images === 'string') {
									imagesArray = JSON.parse(item.images);
									imagesCount = Array.isArray(imagesArray) ? imagesArray.length : 0;
								} else if (Array.isArray(item.images)) {
									imagesArray = item.images;
									imagesCount = imagesArray.length;
								}
							} catch (e) {
								imagesCount = 0;
							}

							// 테이블 이름 결정
							const tableName = item.title === '프로그램' ? 'galleryProgram' : 
											   item.title === '후원물품' ? 'gallerySupport' : '알 수 없음';
							
							return (
								<div key={index} className="backup-list-item">
									<div className='vertical-bar'></div>
									<p className="backup-col-index">{index + 1}</p>
									<div className='vertical-bar'></div>
									<p className="backup-col-id">{item.id || ''}</p>
									<div className='vertical-bar'></div>
									<p className="backup-col-name">{item.title || ''}</p>
									<div className='vertical-bar'></div>
									<p className="backup-col-company">{tableName}</p>
									<div className='vertical-bar'></div>
									<div className="text backup-col-status">
										<p style={{color: '#2c3d54', fontWeight: 'bold'}}>
											{imagesCount}개 항목
										</p>
										<p style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>
											{item.bookletId || ''}
										</p>
									</div>
									<div className='vertical-bar'></div>
									<p className="backup-col-date">{imagesCount > 0 ? '저장대기' : '데이터없음'}</p>
									<div className='vertical-bar'></div>
								</div>
							)
						})
						:
						<div className="backup-empty">
							<p>검색결과가 없습니다.</p>
						</div>
					}
				</div>


			</div>

			



			<div className="backup-spacer"></div>
		</div>
		
	);
}