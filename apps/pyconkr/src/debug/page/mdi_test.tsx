import React from "react";

import { Box, Button, Card, CardContent, TextField, Typography } from "@mui/material";

import * as Common from "@frontend/common";

const LOCAL_STEORAGE_KEY = "mdi_test_input";
const MDX_TEST_STRING = `\
MDX 간단 사용 설명서

긴 가로줄을 넣고 싶다면, \`---\`를 사용해주세요!

---

제목은 아래와 같이 표현해요.
# H1
## H2
### H3
#### H4
##### H5
###### H6

---

**굵은 글자는 이렇게**
*이탤릭(기울어진 글자)는 요렇게*
응용 표현으로 ***굵으면서 기울어진 글자는 요렇게***

[링크는 이렇게 사용하고요,](https://pycon.kr)
변수명과 같은 짧은 코드는 \`이렇게\` 표현해요!
\`\`\`
# 긴 코드는 이렇게 표현할 수 있어요.
import antigravity
\`\`\`

---

HTML 태그 중 일부를 사용할 수 있어요!

예를 들면 <sub>sub</sub> 태그나
위로 가는 <sup>sup</sup> 태그도 있고요,
밑줄도 <ins>표현할 수 있죠!</ins>

---

> 인용구는 이렇게 표현해요.
> 여러 줄을 표현할수도 있고요!

---

사진 첨부는 이렇게 해요!
![OctoCat](https://myoctocat.com/assets/images/base-octocat.svg)

만약 크기 조절을 하고 싶다면 HTML 태그도 가능해요!
<img width="150px" src="https://myoctocat.com/assets/images/base-octocat.svg" />

---

- 순번이 없는 목록은 이렇게 사용해요.
- 만약 하위 항목을 표현하고 싶으시다면
  - 이렇게 앞에 공백 2개를 붙여주세요!

---

1. 순번이 있는 목록은 이렇게 사용해요.
2. 실수로 다음의 숫자를 잘못 적어도
1. 자동으로 제대로 3번으로 나와요!

---

{ /*
화면 상에는 노출되지 않는 주석은 이렇게 사용해요.
주의하실 점은, 서버에서 클라이언트로 페이지의 내용을 응답할때는 요 주석 데이터도 같이 보내지므로, 절때 민감한 내용을 주석에 담지는 말아주세요!
*/ }
`

const getMdxInputFromLocalStorage: () => string = () => {
  const input = localStorage.getItem(LOCAL_STEORAGE_KEY);
  return input ? input : "";
}

const setMdxInputToLocalStorage: (input: string) => string = (input) => {
  localStorage.setItem(LOCAL_STEORAGE_KEY, input);
  return input;
}

export const MdiTestPage: React.FC = () => {
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const [mdxInput, setMdxInput] = React.useState(getMdxInputFromLocalStorage());

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>MDX 에디터</Typography>
      <TextField inputRef={inputRef} defaultValue={mdxInput} multiline fullWidth minRows={4} sx={{ my: 2 }} />
      <Button variant="contained" onClick={() => inputRef.current && setMdxInput(setMdxInputToLocalStorage(inputRef.current.value))}>변환</Button>
      &nbsp;
      <Button variant="contained" onClick={() => setMdxInput(MDX_TEST_STRING)}>테스트용 Help Text 로딩</Button>
      <br />
      <br />
      <Card>
        <CardContent>
          <Common.Components.MDXRenderer text={mdxInput} />
        </CardContent>
      </Card>
    </Box>
  );
};
