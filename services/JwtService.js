import { JWT_SECRET } from "../config";
import Jwt from 'jsonwebtoken';

class JwtService{
    static sign(payload,expiry='2d',secret=JWT_SECRET){
        return Jwt.sign(payload,secret,{expiresIn:expiry});
    }

    static verify(payload, secret=JWT_SECRET){
        return Jwt.verify(payload,secret);
    }
}

export default JwtService;