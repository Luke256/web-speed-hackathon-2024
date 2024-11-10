// import { useRef } from 'react';
// import { useAsync } from 'react-use';
// import styled from 'styled-components';

// import { decrypt } from '@wsh-2024/image-encrypt/src/decrypt';

// import { getImageUrl } from '../../../lib/image/getImageUrl';

// const _Canvas = styled.canvas`
//   height: 100%;
//   width: auto;
//   flex-grow: 0;
//   flex-shrink: 0;
// `;

// type Props = {
//   pageImageId: string;
// };

// export const ComicViewerPage = ({ pageImageId }: Props) => {
//   const ref = useRef<HTMLCanvasElement>(null);

//   useAsync(async () => {
//     const image = new Image();
//     image.src = getImageUrl({
//       format: 'jxl',
//       imageId: pageImageId,
//     });
//     await image.decode();

//     const canvas = ref.current!;
//     canvas.width = image.naturalWidth;
//     canvas.height = image.naturalHeight;
//     const ctx = canvas.getContext('2d')!;

//     decrypt({
//       exportCanvasContext: ctx,
//       sourceImage: image,
//       sourceImageInfo: {
//         height: image.naturalHeight,
//         width: image.naturalWidth,
//       },
//     });

//     canvas.setAttribute('role', 'img');
//   }, [pageImageId]);

//   return <_Canvas ref={ref} />;
// };
import { useRef, useEffect, useState } from 'react';
import { useAsync } from 'react-use';
import styled from 'styled-components';

import { decrypt } from '@wsh-2024/image-encrypt/src/decrypt';
import { getImageUrl } from '../../../lib/image/getImageUrl';

const _Canvas = styled.canvas`
  height: 100%;
  width: auto;
  flex-grow: 0;
  flex-shrink: 0;
`;

type Props = {
  pageImageId: string;
};

export const ComicViewerPage = ({ pageImageId }: Props) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const observerRef = useRef<HTMLDivElement>(null); // IntersectionObserver用のラッパー
  const [preparedImage, setPreparedImage] = useState<HTMLImageElement | null>(null);

  // 事前に画像を準備する
  useEffect(() => {
    const image = new Image();
    image.src = getImageUrl({
      format: 'jxl',
      imageId: pageImageId,
    });

    setPreparedImage(image); // 画像を準備済みとして保存
  }, [pageImageId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && preparedImage) {
          await preparedImage.decode();

          const canvas = ref.current!;
          canvas.width = preparedImage.naturalWidth;
          canvas.height = preparedImage.naturalHeight;
          const ctx = canvas.getContext('2d')!;

          decrypt({
            exportCanvasContext: ctx,
            sourceImage: preparedImage,
            sourceImageInfo: {
              height: preparedImage.naturalHeight,
              width: preparedImage.naturalWidth,
            },
          });

          canvas.setAttribute('role', 'img');
          observer.disconnect(); // 読み込み後はObserverを解除
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerRef.current!);

    return () => observer.disconnect();
  }, [preparedImage]);

  return (
    <div ref={observerRef}>
      <_Canvas ref={ref} />
    </div>
  );
};
