//입력받은 토큰을 가진 사용자가 있는지 확인해서 있으면 userId를 req.session.user에 저장한다
import { NextApiRequest, NextApiResponse } from "next";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { token } = req.body;
  const foundToken = await client.token.findUnique({
    where: {
      payload: token,
    },
  });
  if (!foundToken) return res.status(404).end();
  req.session.user = {
    id: foundToken.userId,
  };
  await req.session.save();
  //토큰삭제
  await client.token.deleteMany({
    where: {
      userId: foundToken.userId,
    },
  });
  //결과보냄
  res.json({ ok: true });
}
export default withApiSession(
  withHandler({ methods: ["POST"], handler, isPrivate: false })
);
