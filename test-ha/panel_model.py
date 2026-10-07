import math
def gclear(h, noon, lat, N, tilt, orient, fattore=1.0):
    rad=math.pi/180
    dec=23.45*math.sin(2*math.pi*(284+N)/365)*rad
    phi=lat*rad; beta=tilt*rad; gam=(orient-180)*rad
    w=(h-noon)*15*rad
    se=math.sin(phi)*math.sin(dec)+math.cos(phi)*math.cos(dec)*math.cos(w)
    if se<=0.05: return 0.0
    dni=1353*0.7**((1/se)**0.678)
    ct=(math.sin(dec)*math.sin(phi)*math.cos(beta)-math.sin(dec)*math.cos(phi)*math.sin(beta)*math.cos(gam)
        +math.cos(dec)*math.cos(phi)*math.cos(beta)*math.cos(w)+math.cos(dec)*math.sin(phi)*math.sin(beta)*math.cos(gam)*math.cos(w)
        +math.cos(dec)*math.sin(beta)*math.sin(gam)*math.sin(w))
    return (dni*max(ct,0)+0.1*dni*(1+math.cos(beta))/2)*fattore
def simulate(ore, now_h, t0, noon, lat, N, tilt=35, orient=180, k=0.07, tau=150, t_ext_now=None, g_obs=None, fattore=1.0):
    gcn=gclear(now_h,noon,lat,N,tilt,orient,fattore)
    kt_obs=min(1.1,max(0,g_obs/gcn)) if (g_obs is not None and gcn>150) else None
    bias=0
    if t_ext_now is not None:
        near=min(ore,key=lambda o:abs(o['h']-now_h)); bias=max(-8,min(8,t_ext_now-near['t']))
    t=t0; mx=t0; prev=now_h; gmax=0
    for o in ore:
        if o['h']<=now_h: continue
        dt=o['h']-prev; prev=o['h']
        g=gclear(o['h'],noon,lat,N,tilt,orient,fattore)
        ktf=1-0.75*(o['n']/100)**3.4
        if kt_obs is not None:
            wgt=math.exp(-(o['h']-now_h)/2); kt=ktf+(kt_obs-ktf)*wgt
        else: kt=ktf
        g*=kt; gmax=max(gmax,g)
        treg=o['t']+bias+k*g*(1-o['u']/600)
        a=1-math.exp(-dt*60/tau)
        t=t+a*(treg-t); mx=max(mx,t)
    return mx,gmax,bias,kt_obs
if __name__=="__main__":
    lat=43.11; noon=13.1; N=280
    print("G clear plane a mezzogiorno:", round(gclear(13.1,noon,lat,N,35,180)), " ore 10:", round(gclear(10,noon,lat,N,35,180)), " ore 15:", round(gclear(15,noon,lat,N,35,180)), " ore 17:", round(gclear(17,noon,lat,N,35,180)))
    for nome,n in (("sereno",5),("variabile",50),("coperto",95)):
        ore=[{"h":h,"t":16+10*math.sin(math.pi*(h-7)/12) if 7<h<19 else 16,"u":60,"n":n} for h in range(7,20)]
        mx,g,b,k=simulate(ore,7.5,17,noon,lat,N,t_ext_now=17)
        print(nome, "T max prevista", round(mx,1), "G plane picco", round(g))
